import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as serviceClient } from '@supabase/supabase-js';
import { getValidAccessToken } from '@/lib/google';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { fileId, fileName, mimeType, folderId } = await request.json();

  const accessToken = await getValidAccessToken(user.id);
  if (!accessToken) return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  // Download file from Drive
  const driveRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!driveRes.ok) return NextResponse.json({ error: 'Drive download failed' }, { status: 500 });

  const buffer = await driveRes.arrayBuffer();

  // Upload to Supabase Storage
  const svc  = serviceClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const path = `${user.id}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await svc.storage
    .from('clip-media')
    .upload(path, buffer, { contentType: mimeType, upsert: true });
  if (uploadError) return NextResponse.json({ error: 'Storage upload failed' }, { status: 500 });

  const { data: { publicUrl } } = svc.storage.from('clip-media').getPublicUrl(path);

  // Create clip record
  const { data: clip, error: clipError } = await svc.from('clips').insert({
    user_id:          user.id,
    clip_name:        fileName.replace(/\.[^/.]+$/, ''),
    category:         'Other',
    folder_id:        folderId ?? null,
    thumbnail_url:    publicUrl,
    views: 0, saves: 0, shares: 0, watch_time_pct: 0,
    profile_visits: 0, affiliate_clicks: 0, comments: 0,
    reposts: 0, followers_gained: 0,
  }).select().single();

  if (clipError) return NextResponse.json({ error: 'Clip creation failed' }, { status: 500 });

  return NextResponse.json({ clip, publicUrl });
}
