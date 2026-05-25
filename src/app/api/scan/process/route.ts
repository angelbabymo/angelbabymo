import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { extractProduct } from '@/lib/agents/extraction';
import { scoreProduct } from '@/lib/agents/scoring';
import { generateContent } from '@/lib/agents/content';

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const supa = getServiceSupabase();

  const since = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: signals } = await supa
    .from('raw_signals')
    .select('*')
    .gte('scraped_at', since)
    .limit(200);
  if (!signals?.length) return NextResponse.json({ ok: true, processed: 0 });

  // Pre-fetch brand ai_prompts to avoid N+1 queries
  const brandIds = [...new Set(signals.map((s: any) => s.brand_id).filter(Boolean))];
  const { data: brands } = await supa.from('brands').select('id, profile').in('id', brandIds);
  const brandPromptMap: Record<string, string | null> = {};
  for (const b of brands ?? []) {
    brandPromptMap[b.id] = (b.profile as any)?.ai_prompt ?? null;
  }

  let processed = 0;
  for (const sig of signals) {
    const aiPrompt = brandPromptMap[sig.brand_id] ?? null;
    try {
      const extracted = await extractProduct(sig.payload);
      if (!extracted?.normalized_name) continue;

      const { data: product } = await supa.from('products').upsert({
        brand_id: sig.brand_id,
        user_id: sig.user_id,
        product_name: extracted.product_name,
        normalized_name: extracted.normalized_name,
        hook_style: extracted.hook_style,
        price_usd: extracted.price_usd,
        original_price_usd: extracted.original_price_usd,
        discount_percent: extracted.discount_percent,
        commission_rate: extracted.commission_rate,
        affiliate_eligible: extracted.affiliate_eligible,
        units_sold_total: extracted.units_sold_total,
        units_sold_30d: extracted.units_sold_30d,
        product_rating: extracted.product_rating,
        review_count: extracted.review_count,
        creator_count_30d: extracted.creator_count_30d,
        engagement_signals: extracted.engagement_signals,
        comment_sentiment: extracted.comment_sentiment,
        shop_name: extracted.shop_name,
        shop_rating: extracted.shop_rating,
        shop_review_count: extracted.shop_review_count,
        product_image_url: extracted.product_image_url,
        product_url: extracted.product_url,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'brand_id,normalized_name' }).select().single();
      if (!product) continue;

      const scored = await scoreProduct({ product: extracted, history: [] }, aiPrompt);
      await supa.from('product_scores').insert({
        brand_id: sig.brand_id,
        product_id: product.id,
        user_id: sig.user_id,
        score: scored.score,
        stage: scored.stage,
        reason: scored.reason,
        hook: scored.hook,
        action: scored.action,
        rubric_breakdown: scored.rubric_breakdown,
      });

      if (scored.score >= 8) {
        const content = await generateContent({ product: extracted, score: scored }, aiPrompt);
        await supa.from('drafts').insert({
          brand_id: sig.brand_id,
          product_id: product.id,
          user_id: sig.user_id,
          script: content.script,
          caption: content.caption,
          cta: content.cta,
          spark_recommendation: content.spark_recommendation,
          hook_variations: content.hook_variations,
        });

        fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
          method: 'POST',
          headers: { authorization: `Bearer ${process.env.CRON_SECRET}`, 'content-type': 'application/json' },
          body: JSON.stringify({
            userId: sig.user_id,
            title: `🔥 ${extracted.product_name} — ${scored.score}/10`,
            body: scored.reason,
            url: '/intel',
          }),
        }).catch(() => {});
      }
      processed++;
    } catch (e) { console.error('process error', e); }
  }
  return NextResponse.json({ ok: true, processed });
}
