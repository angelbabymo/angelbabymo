'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';
import { Clip } from '@/types';

// folderId = undefined → all clips; null → root (no folder); string → specific folder
export function useClips(folderId?: string | null) {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();

  return useQuery<Clip[]>({
    queryKey: ['clips', brand?.id, folderId],
    enabled: !brandLoading,
    queryFn: async () => {
      if (!brand?.id) return [];
      const query = supabase
        .from('clips')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false });

      if (folderId === null) {
        query.is('folder_id', null);
      } else if (folderId !== undefined) {
        query.eq('folder_id', folderId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddClip() {
  const { data: brand } = useBrand();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clip: Partial<Clip>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('clips')
        .insert({ ...clip, user_id: user?.id, brand_id: brand?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}

export function useUpdateClip() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Clip> & { id: string }) => {
      const { data, error } = await supabase
        .from('clips')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}

export function useDeleteClip() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('clips').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}
