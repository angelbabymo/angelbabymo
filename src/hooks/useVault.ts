'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';
import { VaultItem } from '@/types';

export function useVault() {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();

  return useQuery<VaultItem[]>({
    queryKey: ['vault', brand?.id],
    enabled: !brandLoading,
    queryFn: async () => {
      if (!brand?.id) return [];
      const { data, error } = await supabase
        .from('vault_items')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useAddVaultItem() {
  const { data: brand } = useBrand();
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Partial<VaultItem>) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('vault_items')
        .insert({ ...item, user_id: user?.id, brand_id: brand?.id ?? null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}

export function useUpdateVaultItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VaultItem> & { id: string }) => {
      const { data, error } = await supabase
        .from('vault_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}

export function useDeleteVaultItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vault_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['vault'] }),
  });
}
