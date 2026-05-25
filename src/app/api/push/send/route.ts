import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { getServiceSupabase } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT!,
    process.env.VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!,
  );
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const { userId, title, body, url } = await req.json();
  const supa = getServiceSupabase();
  const { data: subs } = await supa.from('push_subscriptions').select('*').eq('user_id', userId);
  if (!subs?.length) return NextResponse.json({ ok: true, sent: 0 });

  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        JSON.stringify({ title, body, url }),
      );
      sent++;
    } catch (e: any) {
      if (e.statusCode === 410) {
        await supa.from('push_subscriptions').delete().eq('endpoint', s.endpoint);
      }
    }
  }
  return NextResponse.json({ ok: true, sent });
}
