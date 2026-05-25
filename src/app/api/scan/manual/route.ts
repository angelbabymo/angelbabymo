import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(_req: NextRequest) {
  try {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Rate limit check
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supa
      .from('scrape_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'rate_limited', message: 'Max 3 scans per 24h' }, { status: 429 });
    }

    // Check niches before firing
    const { data: niches, error: nichesError } = await supa
      .from('niches')
      .select('id, name, keywords, enabled')
      .eq('user_id', user.id);

    if (nichesError) {
      return NextResponse.json({ error: 'db_error', message: `Database error: ${nichesError.message}` }, { status: 500 });
    }

    const allNiches    = niches ?? [];
    const enabledCount = allNiches.filter(n => n.enabled).length;
    const withKeywords = allNiches.filter(n => n.enabled && n.keywords?.length > 0).length;

    if (allNiches.length === 0) {
      return NextResponse.json({
        error: 'no_niches',
        message: 'No niches set up. Go to Brands → your brand → Manage Niches & Keywords to add one.',
      }, { status: 422 });
    }

    if (enabledCount === 0) {
      return NextResponse.json({
        error: 'no_enabled_niches',
        message: `You have ${allNiches.length} niche${allNiches.length !== 1 ? 's' : ''} but none are enabled. Toggle one on in Brands → Niches.`,
      }, { status: 422 });
    }

    if (withKeywords === 0) {
      return NextResponse.json({
        error: 'no_keywords',
        message: 'Your enabled niches have no keywords. Add at least one keyword to start scanning.',
      }, { status: 422 });
    }

    const runRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/scan/run`, {
      method: 'POST',
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    });

    const body = await runRes.json().catch(() => ({}));

    if (!runRes.ok) {
      return NextResponse.json({ error: 'run_failed', message: `Scan runner error: ${body?.error ?? runRes.status}` }, { status: 500 });
    }

    if (body.runs === 0) {
      return NextResponse.json({
        error: 'no_runs',
        message: 'Scan started but Apify returned 0 runs. Check that your niches have keywords.',
      }, { status: 422 });
    }

    return NextResponse.json(body);
  } catch (e: any) {
    console.error('Manual scan error:', e);
    return NextResponse.json({ error: 'unexpected', message: e?.message ?? String(e) }, { status: 500 });
  }
}
