'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';
import { Folder } from '@/types';

export function useFolders(parentId: string | null) {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();

  return useQuery<Folder[]>({
    queryKey: ['folders', brand?.id, parentId],
    enabled: !brandLoading,
    queryFn: async () => {
      if (!brand?.id) return [];
      const query = supabase
        .from('folders')
        .select('*')
        .eq('brand_id', brand.id)
        .order('name', { ascending: true });

      if (parentId === null) {
        query.is('parent_id', null);
      } else {
        query.eq('parent_id', parentId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateFolder() {
  const { data: brand } = useBrand();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, parentId }: { name: string; parentId: string | null }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('folders')
        .insert({ name, parent_id: parentId, user_id: user!.id, brand_id: brand?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useDeleteFolder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, parentId }: { id: string; parentId: string | null }) => {
      const { error } = await supabase.from('folders').delete().eq('id', id);
      if (error) throw error;
      return parentId;
    },
    onSuccess: (_data, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['clips'] });
    },
  });
}

export function useRenameFolder() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, parentId }: { id: string; name: string; parentId: string | null }) => {
      const { error } = await supabase.from('folders').update({ name }).eq('id', id);
      if (error) throw error;
      return parentId;
    },
    onSuccess: (_data, { parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}
