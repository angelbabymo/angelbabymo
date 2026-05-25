'use server';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export async function createBrand(input: { name: string; slug: string; description?: string; profile?: object }) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('unauthorized');

  const { data: brand, error } = await supa.from('brands').insert({
    owner_user_id: user.id,
    name: input.name,
    slug: input.slug,
    description: input.description ?? null,
    profile: input.profile ?? {},
  }).select().single();
  if (error) throw new Error(error.message);

  await supa.from('brand_members').insert({ brand_id: brand.id, user_id: user.id, role: 'owner' });
  revalidatePath('/intel');
  revalidatePath('/brands');
  return brand;
}

export async function updateBrand(brandId: string, patch: Partial<{ name: string; description: string; is_active: boolean; profile: object }>) {
  const supa = await createClient();
  const { error } = await supa.from('brands').update(patch).eq('id', brandId);
  if (error) throw new Error(error.message);
  revalidatePath('/intel');
  revalidatePath('/brands');
}

export async function switchBrand(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set('current_brand_slug', slug, {
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/intel');
}

export async function createNiche(brandId: string, name: string, keywords: string[]) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('unauthorized');
  const { data, error } = await supa.from('niches').insert({
    brand_id: brandId, user_id: user.id, name, keywords, enabled: true,
  }).select().single();
  if (error) throw new Error(error.message);
  revalidatePath('/brands');
  return data;
}

export async function updateNiche(nicheId: string, patch: Partial<{ name: string; keywords: string[]; enabled: boolean }>) {
  const supa = await createClient();
  const { error } = await supa.from('niches').update(patch).eq('id', nicheId);
  if (error) throw new Error(error.message);
  revalidatePath('/brands');
}

export async function deleteNiche(nicheId: string) {
  const supa = await createClient();
  const { error } = await supa.from('niches').delete().eq('id', nicheId);
  if (error) throw new Error(error.message);
  revalidatePath('/brands');
}

export async function deleteBrand(brandId: string) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error('unauthorized');
  // Only allow owner to delete
  const { error } = await supa.from('brands').delete().eq('id', brandId).eq('owner_user_id', user.id);
  if (error) throw new Error(error.message);
  revalidatePath('/brands');
  revalidatePath('/intel');
}
