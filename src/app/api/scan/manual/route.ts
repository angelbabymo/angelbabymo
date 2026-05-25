import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_req: NextRequest) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supa
    .from('scrape_runs')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('started_at', since);
  if ((count ?? 0) >= 3) {
    return NextResponse.json({ error: 'rate_limited', message: 'Max 3 scans per 24h' }, { status: 429 });
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scan/run`, {
    method: 'POST',
    headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
  });
  return NextResponse.json(await res.json());
}
