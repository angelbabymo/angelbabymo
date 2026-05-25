'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';
import { ScheduledPost } from '@/types';

export function usePosts() {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();

  return useQuery<ScheduledPost[]>({
    queryKey: ['posts', brand?.id],
    enabled: !brandLoading,
    queryFn: async () => {
      if (!brand?.id) return [];
      const { data, error } = await supabase
        .from('scheduled_posts')
        .select('*')
        .eq('brand_id', brand.id)
        .order('scheduled_for', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddPost() {
  const { data: brand } = useBrand();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: Partial<ScheduledPost>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('scheduled_posts')
        .insert({ ...post, user_id: user?.id, brand_id: brand?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useUpdatePost() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ScheduledPost> & { id: string }) => {
      const { data, error } = await supabase
        .from('scheduled_posts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}

export function useDeletePost() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_posts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] }),
  });
}
