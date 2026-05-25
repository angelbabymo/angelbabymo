import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { runTikTokShopActor, runTikTokHashtagActor } from '@/lib/sources/apify';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supa = getServiceSupabase();
  const { data: niches } = await supa.from('niches').select('*, brands(id, owner_user_id)').eq('enabled', true);
  if (!niches?.length) return NextResponse.json({ ok: true, runs: 0 });

  const base = process.env.NEXT_PUBLIC_APP_URL!;
  const webhookUrl = `${base}/api/scan/ingest?secret=${process.env.APIFY_WEBHOOK_SECRET}`;
  let runs = 0;

  for (const n of niches) {
    for (const source of ['apify-tiktok-shop', 'apify-tiktok-hashtag'] as const) {
      const { data: run } = await supa.from('scrape_runs').insert({
        brand_id: n.brand_id,
        user_id: n.user_id,
        niche_id: n.id,
        source,
        status: 'queued',
      }).select().single();
      if (!run) continue;

      try {
        const apifyId = source === 'apify-tiktok-shop'
          ? await runTikTokShopActor(n.keywords, webhookUrl, n.user_id, n.brand_id, run.id)
          : await runTikTokHashtagActor(n.keywords, webhookUrl, n.user_id, n.brand_id, run.id);
        await supa.from('scrape_runs').update({ apify_run_id: apifyId, status: 'running' }).eq('id', run.id);
        runs++;
      } catch (e: any) {
        await supa.from('scrape_runs').update({ status: 'failed', error: e.message }).eq('id', run.id);
      }
    }
  }
  return NextResponse.json({ ok: true, runs });
}
