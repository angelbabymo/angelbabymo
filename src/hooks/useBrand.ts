'use client';
import { useQuery } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';

function getCookieBrand(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/current_brand_slug=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  profile: Record<string, any> | null;
}

export function useBrand() {
  const supabase = createClient();
  const slug = getCookieBrand();

  return useQuery<Brand | null>({
    queryKey: ['brand', slug],
    queryFn: async () => {
      if (!slug) return null;
      const { data } = await supabase
        .from('brands')
        .select('id, name, slug, description, profile')
        .eq('slug', slug)
        .single();
      return data ?? null;
    },
    staleTime: 5 * 60 * 1000,
  });
}
