'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';

export interface Checklist {
  id: string;
  user_id: string;
  brand_id: string | null;
  title: string;
  description: string | null;
  emoji: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  checklist_id: string;
  text: string;
  completed: boolean;
  position: number;
  created_at: string;
}

export function useChecklists() {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();
  return useQuery<Checklist[]>({
    queryKey: ['checklists', brand?.id],
    enabled: !brandLoading,
    queryFn: async () => {
      if (!brand?.id) return [];
      const { data, error } = await supabase
        .from('checklists')
        .select('*')
        .eq('brand_id', brand.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useChecklistItems(checklistId: string | null) {
  const supabase = createClient();
  return useQuery<ChecklistItem[]>({
    queryKey: ['checklist-items', checklistId],
    enabled: !!checklistId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('checklist_items')
        .select('*')
        .eq('checklist_id', checklistId!)
        .order('position', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useCreateChecklist() {
  const { data: brand } = useBrand();
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, description, emoji, items }: { title: string; description?: string; emoji: string; items: string[] }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: checklist, error: cErr } = await supabase
        .from('checklists')
        .insert({ title, description: description ?? null, emoji, user_id: user!.id, brand_id: brand?.id ?? null })
        .select()
        .single();
      if (cErr) throw cErr;

      if (items.length > 0) {
        const rows = items.map((text, i) => ({
          checklist_id: checklist.id, text, position: i, completed: false,
        }));
        const { error: iErr } = await supabase.from('checklist_items').insert(rows);
        if (iErr) throw iErr;
      }
      return checklist;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });
}

export function useDeleteChecklist() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('checklists').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['checklists'] }),
  });
}

export function useToggleItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, completed, checklistId }: { id: string; completed: boolean; checklistId: string }) => {
      const { error } = await supabase.from('checklist_items').update({ completed }).eq('id', id);
      if (error) throw error;
      return checklistId;
    },
    onMutate: async ({ id, completed, checklistId }) => {
      await queryClient.cancelQueries({ queryKey: ['checklist-items', checklistId] });
      const prev = queryClient.getQueryData<ChecklistItem[]>(['checklist-items', checklistId]);
      queryClient.setQueryData<ChecklistItem[]>(['checklist-items', checklistId], (old) =>
        old?.map((item) => item.id === id ? { ...item, completed } : item) ?? []
      );
      return { prev };
    },
    onError: (_err, { checklistId }, ctx) => {
      queryClient.setQueryData(['checklist-items', checklistId], ctx?.prev);
    },
  });
}

export function useAddItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ checklistId, text, position }: { checklistId: string; text: string; position: number }) => {
      const { data, error } = await supabase
        .from('checklist_items')
        .insert({ checklist_id: checklistId, text, position, completed: false })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, { checklistId }) =>
      queryClient.invalidateQueries({ queryKey: ['checklist-items', checklistId] }),
  });
}

export function useDeleteItem() {
  const supabase = createClient();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, checklistId }: { id: string; checklistId: string }) => {
      const { error } = await supabase.from('checklist_items').delete().eq('id', id);
      if (error) throw error;
      return checklistId;
    },
    onSuccess: (_data, { checklistId }) =>
      queryClient.invalidateQueries({ queryKey: ['checklist-items', checklistId] }),
  });
}
