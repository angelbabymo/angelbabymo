'use client';
import { createClient } from './client';

export async function uploadClipMedia(file: File): Promise<string> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('clip-media')
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('clip-media')
    .getPublicUrl(path);

  return publicUrl;
}
