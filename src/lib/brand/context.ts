import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function getCurrentBrand() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const slugFromCookie = cookieStore.get('current_brand_slug')?.value;

  let q = supa.from('brands').select('*').eq('owner_user_id', user.id).eq('is_active', true);
  if (slugFromCookie) q = (q as any).eq('slug', slugFromCookie);
  const { data: brand } = await (q as any).limit(1).maybeSingle();
  if (brand) return brand;

  // Fallback: first active brand owned by user
  const { data: fallback } = await supa
    .from('brands')
    .select('*')
    .eq('owner_user_id', user.id)
    .eq('is_active', true)
    .limit(1)
    .maybeSingle();
  return fallback ?? null;
}

export async function listMyBrands() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return [];
  const { data } = await supa
    .from('brands')
    .select('*')
    .eq('owner_user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });
  return data ?? [];
}
