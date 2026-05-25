import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/supabase/server';
import { fetchApifyDataset } from '@/lib/sources/apify';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  if (url.searchParams.get('secret') !== process.env.APIFY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { userId, brandId, scrapeRunId, source, runId, status } = body;
  const supa = getServiceSupabase();

  if (status === 'ACTOR.RUN.FAILED') {
    await supa.from('scrape_runs').update({ status: 'failed', completed_at: new Date().toISOString() }).eq('id', scrapeRunId);
    return NextResponse.json({ ok: true });
  }

  const items = await fetchApifyDataset(runId);
  if (items.length) {
    await supa.from('raw_signals').insert(
      items.map(payload => ({ brand_id: brandId, user_id: userId, scrape_run_id: scrapeRunId, source, payload }))
    );
  }
  await supa.from('scrape_runs').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', scrapeRunId);

  fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scan/process`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch(() => {});

  return NextResponse.json({ ok: true, items: items.length });
}
