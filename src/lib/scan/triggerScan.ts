import { getServiceSupabase } from '@/lib/supabase/server';
import { runTikTokShopActor, runTikTokHashtagActor } from '@/lib/sources/apify';

export async function triggerScan(): Promise<{ runs: number; errors: string[] }> {
  const supa = getServiceSupabase();
  const base = process.env.NEXT_PUBLIC_APP_URL!;
  const webhookUrl = `${base}/api/scan/ingest?secret=${process.env.APIFY_WEBHOOK_SECRET}`;

  const { data: niches } = await supa
    .from('niches')
    .select('*, brands(id, owner_user_id)')
    .eq('enabled', true);

  if (!niches?.length) return { runs: 0, errors: [] };

  let runs = 0;
  const errors: string[] = [];

  for (const n of niches) {
    for (const source of ['apify-tiktok-shop', 'apify-tiktok-hashtag'] as const) {
      const { data: run, error: insertError } = await supa.from('scrape_runs').insert({
        brand_id: n.brand_id,
        user_id:  n.user_id,
        niche_id: n.id,
        source,
        status:   'queued',
      }).select().single();

      if (insertError || !run) {
        errors.push(`Insert failed for niche ${n.name}: ${insertError?.message}`);
        continue;
      }

      try {
        const apifyId = source === 'apify-tiktok-shop'
          ? await runTikTokShopActor(n.keywords, webhookUrl, n.user_id, n.brand_id, run.id)
          : await runTikTokHashtagActor(n.keywords, webhookUrl, n.user_id, n.brand_id, run.id);
        await supa.from('scrape_runs').update({ apify_run_id: apifyId, status: 'running' }).eq('id', run.id);
        runs++;
      } catch (e: any) {
        await supa.from('scrape_runs').update({ status: 'failed', error: e.message }).eq('id', run.id);
        errors.push(`Apify failed for niche ${n.name}: ${e.message}`);
      }
    }
  }

  return { runs, errors };
}
