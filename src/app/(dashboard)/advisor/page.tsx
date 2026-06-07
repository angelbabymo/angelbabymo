'use client';

import { useEffect, useState } from 'react';
import { useBrand } from '@/hooks/useBrand';
import { createClient } from '@/lib/supabase/client';
import AdvisorChat from './_components/AdvisorChat';

export default function AdvisorPage() {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!brand?.id) return;

    async function getOrCreateConversation() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('advisor_conversations')
        .select('id')
        .eq('brand_id', brand!.id)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        return;
      }

      const { data: created } = await supabase
        .from('advisor_conversations')
        .insert({ brand_id: brand!.id, user_id: user.id, title: 'Session 1' })
        .select('id')
        .single();

      if (created) setConversationId(created.id);
    }

    getOrCreateConversation();
  }, [brand?.id]);

  if (brandLoading) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-3)' }}>
        <span className="animate-pulse text-sm">Loading…</span>
      </div>
    );
  }

  if (!brand) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-3)' }}>
        <p className="text-sm">Select a brand from the sidebar to get started.</p>
      </div>
    );
  }

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full" style={{ color: 'var(--text-3)' }}>
        <span className="animate-pulse text-sm">Starting conversation…</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8" style={{ background: 'var(--bg)' }}>
      <div
        className="flex items-center gap-3 px-6 py-4"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: 'var(--surface-2)' }}
        >
          DV
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Dr. Victor Viral</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Your AI Content Strategist</p>
        </div>
      </div>
      <AdvisorChat conversationId={conversationId} brandId={brand.id} />
    </div>
  );
}
