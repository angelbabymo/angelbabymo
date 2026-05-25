import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken } from '@/lib/google';

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const folderId = new URL(request.url).searchParams.get('folderId') ?? 'root';

  const accessToken = await getValidAccessToken(user.id);
  if (!accessToken) return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  const q      = `'${folderId}' in parents and trashed=false`;
  const fields = 'files(id,name,mimeType,thumbnailLink,size,modifiedTime)';
  const url    = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(q)}&fields=${encodeURIComponent(fields)}&orderBy=folder,name&pageSize=200`;

  const res = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!res.ok) return NextResponse.json({ error: 'Drive API error' }, { status: 500 });

  return NextResponse.json(await res.json());
}
