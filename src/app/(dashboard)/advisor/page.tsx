'use client';

import { useEffect, useState } from 'react';
import { useBrand } from '@/hooks/useBrand';
import { createClient } from '@/lib/supabase/client';
import AdvisorChat from './_components/AdvisorChat';

export default function AdvisorPage() {
  const { data: brand, isLoading: brandLoading } = useBrand();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (brandLoading || !brand?.id) return;

    async function getOrCreateConversation() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setError('Not authenticated'); return; }

        const { data: existing, error: fetchErr } = await supabase
          .from('advisor_conversations')
          .select('id')
          .eq('brand_id', brand!.id)
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (fetchErr) { setError(fetchErr.message); return; }

        if (existing) { setConversationId(existing.id); return; }

        const { data: created, error: insertErr } = await supabase
          .from('advisor_conversations')
          .insert({ brand_id: brand!.id, user_id: user.id, title: 'Session 1' })
          .select('id')
          .single();

        if (insertErr) { setError(insertErr.message); return; }
        if (created) setConversationId(created.id);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      }
    }

    getOrCreateConversation();
  }, [brand?.id, brandLoading]);

  function renderBody() {
    if (brandLoading) return <p className="text-sm animate-pulse" style={{ color: 'var(--text-3)' }}>Loading brand…</p>;
    if (!brand) return <p className="text-sm" style={{ color: 'var(--text-3)' }}>Select a brand from the sidebar to get started.</p>;
    if (error) return <p className="text-sm font-mono" style={{ color: 'var(--red)' }}>{error}</p>;
    if (!conversationId) return <p className="text-sm animate-pulse" style={{ color: 'var(--text-3)' }}>Starting conversation…</p>;
    return <AdvisorChat conversationId={conversationId} brandId={brand.id} />;
  }

  const body = renderBody();
  const isChat = !!conversationId && !!brand && !error;

  return (
    <div className="flex flex-col h-full -m-4 md:-m-8" style={{ background: 'var(--bg)' }}>
      <div
        className="flex items-center gap-3 px-6 py-4 shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
          style={{ background: 'var(--surface-2)' }}
        >
          DV
        </div>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Dr. Duffey</p>
          <p className="text-xs" style={{ color: 'var(--text-3)' }}>Your AI Content Strategist</p>
        </div>
      </div>
      {isChat ? body : (
        <div className="flex-1 flex items-center justify-center">{body}</div>
      )}
    </div>
  );
}
