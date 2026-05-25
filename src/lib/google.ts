import { createClient } from '@supabase/supabase-js';

const CLIENT_ID     = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const REDIRECT_URI  = 'https://creator-os-livid.vercel.app/api/auth/google/callback';

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export function getOAuthUrl(userId: string): string {
  const params = new URLSearchParams({
    client_id:     CLIENT_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: 'code',
    scope:         'https://www.googleapis.com/auth/drive.readonly',
    access_type:   'offline',
    prompt:        'consent',
    state:         Buffer.from(userId).toString('base64'),
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri:  REDIRECT_URI,
      grant_type:    'authorization_code',
    }),
  });
  if (!res.ok) throw new Error('Token exchange failed');
  return res.json() as Promise<{ access_token: string; refresh_token: string; expires_in: number }>;
}

async function refreshToken(refresh_token: string) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      refresh_token,
      client_id:     CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type:    'refresh_token',
    }),
  });
  if (!res.ok) throw new Error('Token refresh failed');
  return res.json() as Promise<{ access_token: string; expires_in: number }>;
}

export async function getValidAccessToken(userId: string): Promise<string | null> {
  const db = serviceClient();
  const { data } = await db.from('google_tokens').select('*').eq('user_id', userId).single();
  if (!data) return null;

  // Still valid with 60s buffer
  if (data.expires_at && data.expires_at > Date.now() + 60_000) {
    return data.access_token;
  }

  if (!data.refresh_token) return null;

  const refreshed = await refreshToken(data.refresh_token);
  const expires_at = Date.now() + refreshed.expires_in * 1000;

  await db.from('google_tokens').update({
    access_token: refreshed.access_token,
    expires_at,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId);

  return refreshed.access_token;
}

export async function saveTokens(userId: string, tokens: { access_token: string; refresh_token: string; expires_in: number }) {
  const db = serviceClient();
  await db.from('google_tokens').upsert({
    user_id:       userId,
    access_token:  tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at:    Date.now() + tokens.expires_in * 1000,
    updated_at:    new Date().toISOString(),
  });
}

export async function isDriveConnected(userId: string): Promise<boolean> {
  const db = serviceClient();
  const { data } = await db.from('google_tokens').select('user_id').eq('user_id', userId).single();
  return !!data;
}
