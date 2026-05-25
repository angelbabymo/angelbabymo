import { NextRequest, NextResponse } from 'next/server';
import { triggerScan } from '@/lib/scan/triggerScan';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const result = await triggerScan();
  return NextResponse.json({ ok: true, ...result });
}
