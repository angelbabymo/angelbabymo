'use client';

import { useState, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import MessageBubble from './MessageBubble';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  message_type: 'text' | 'video_analysis';
  video_url?: string;
  analysis_json?: Record<string, unknown>;
}

const URL_REGEX = /^https?:\/\/([a-z0-9-]+\.)?(tiktok\.com|youtube\.com|youtu\.be|instagram\.com)\/.+/i;

export default function AdvisorChat({
  conversationId,
  brandId,
}: {
  conversationId: string;
  brandId: string;
}) {
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamBuffer, setStreamBuffer] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['advisor-messages', conversationId],
    queryFn: async () => {
      const { data } = await supabase
        .from('advisor_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      return data ?? [];
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamBuffer]);

  const isVideoUrl = (text: string) => URL_REGEX.test(text.trim());

  async function sendMessage() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    if (isVideoUrl(text)) {
      setStreaming(true);
      try {
        const res = await fetch('/api/advisor/analyze-video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ conversationId, videoUrl: text, brandId }),
        });
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: 'Analysis failed' }));
          console.error('Video analysis error:', error);
        }
        queryClient.invalidateQueries({ queryKey: ['advisor-messages', conversationId] });
      } catch (e) {
        console.error('Video analysis fetch failed:', e);
      } finally {
        setStreaming(false);
      }
    } else {
      setStreaming(true);
      setStreamBuffer('');
      const res = await fetch('/api/advisor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, message: text, brandId }),
      });

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const parsed = JSON.parse(line.replace('data: ', ''));
              buffer += parsed.text;
              setStreamBuffer(buffer);
            } catch { /* partial chunk */ }
          }
        }
      }

      setStreamBuffer('');
      setStreaming(false);
      queryClient.invalidateQueries({ queryKey: ['advisor-messages', conversationId] });
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && !streaming && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white"
              style={{ background: 'var(--surface-2)' }}
            >
              DV
            </div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              Ask me anything about hooks, virality, or brand strategy — or paste a video URL for a full breakdown.
            </p>
          </div>
        )}
        {messages.map(m => (
          <MessageBubble key={m.id} message={m} />
        ))}
        {streamBuffer && (
          <MessageBubble
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamBuffer,
              message_type: 'text',
            }}
            isStreaming
          />
        )}
        {streaming && !streamBuffer && (
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-3)' }}>
            <span className="animate-pulse">Dr. Duffey is analyzing…</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="px-4 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Ask Dr. Duffey anything, or paste a video URL to analyze…"
            className="flex-1 rounded-xl px-4 py-3 text-sm focus:outline-none"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
            }}
            disabled={streaming}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || streaming}
            className="px-5 py-3 text-sm font-medium rounded-xl transition-opacity disabled:opacity-40"
            style={{ background: 'var(--text)', color: 'var(--bg)' }}
          >
            Send
          </button>
        </div>
        <p className="text-xs mt-2 px-1" style={{ color: 'var(--text-3)' }}>
          Paste a TikTok, YouTube, or Instagram URL for a full video breakdown.
        </p>
      </div>
    </div>
  );
}
