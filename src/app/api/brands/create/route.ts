import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    const input = await req.json();

    const { data: brand, error } = await supabase.from('brands').insert({
      owner_user_id: user.id,
      name: input.name,
      slug: input.slug,
      description: input.description ?? null,
      profile: input.profile ?? {},
    }).select().single();

    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    await supabase.from('brand_members').insert({
      brand_id: brand.id,
      user_id: user.id,
      role: 'owner',
    });

    return NextResponse.json({ brand });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Failed to create brand' }, { status: 500 });
  }
}
