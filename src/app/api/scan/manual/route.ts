import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { triggerScan } from '@/lib/scan/triggerScan';

export async function POST(_req: NextRequest) {
  try {
    const supa = await createClient();
    const { data: { user } } = await supa.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    // Rate limit: max 3 scans per 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supa
      .from('scrape_runs')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', since);
    if ((count ?? 0) >= 3) {
      return NextResponse.json({ error: 'rate_limited', message: 'Max 3 scans per 24h' }, { status: 429 });
    }

    // Pre-flight niche checks
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

    // Trigger directly — no internal HTTP call
    const result = await triggerScan();

    if (result.runs === 0) {
      const detail = result.errors.length ? result.errors[0] : 'No runs created.';
      return NextResponse.json({ error: 'no_runs', message: detail }, { status: 422 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    console.error('Manual scan error:', e);
    return NextResponse.json({ error: 'unexpected', message: e?.message ?? String(e) }, { status: 500 });
  }
}
