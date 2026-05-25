import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode, saveTokens } from '@/lib/google';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/database?error=google_auth_failed`);
  }

  try {
    const userId = Buffer.from(state, 'base64').toString();
    const tokens = await exchangeCode(code);
    await saveTokens(userId, tokens);
    return NextResponse.redirect(`${origin}/database?drive=connected`);
  } catch {
    return NextResponse.redirect(`${origin}/database?error=google_auth_failed`);
  }
}
