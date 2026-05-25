'use client';
import { useState, useRef, KeyboardEvent } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Sparkles, Plus, X, Hammer } from 'lucide-react';
import { useCreateChecklist } from '@/hooks/useChecklists';

interface Props {
  open: boolean;
  onClose: () => void;
}

type Mode = 'manual' | 'ai';

const EMOJI_OPTIONS = ['🎯','📸','🎬','✈️','💼','🌴','👗','💄','🛍️','🔥','⚡','📅'];

export function NewChecklistModal({ open, onClose }: Props) {
  const createChecklist = useCreateChecklist();

  const [mode, setMode]         = useState<Mode>('ai');
  const [title, setTitle]       = useState('');
  const [emoji, setEmoji]       = useState('🎯');
  const [items, setItems]       = useState<string[]>([]);
  const [newItem, setNewItem]   = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [aiError, setAiError]   = useState('');
  const [preview, setPreview]   = useState<{ title: string; emoji: string; description: string; items: string[] } | null>(null);

  const itemInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setTitle(''); setEmoji('🎯'); setItems([]); setNewItem('');
    setAiPrompt(''); setPreview(null); setAiError(''); setMode('ai');
  };

  const handleClose = () => { reset(); onClose(); };

  const addItem = () => {
    const text = newItem.trim();
    if (!text) return;
    setItems((prev) => [...prev, text]);
    setNewItem('');
    itemInputRef.current?.focus();
  };

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const onItemKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addItem(); }
  };

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setAiError('');
    setPreview(null);
    try {
      const res = await fetch('/api/checklists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPreview(data);
    } catch (e: any) {
      setAiError(e.message ?? 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  const handleCreate = async () => {
    const finalTitle = mode === 'ai' ? (preview?.title ?? '') : title;
    const finalEmoji = mode === 'ai' ? (preview?.emoji ?? '🎯') : emoji;
    const finalItems = mode === 'ai' ? (preview?.items ?? []) : items;
    const finalDesc  = mode === 'ai' ? (preview?.description ?? '') : undefined;
    if (!finalTitle.trim()) return;

    await createChecklist.mutateAsync({ title: finalTitle, emoji: finalEmoji, description: finalDesc, items: finalItems });
    handleClose();
  };

  const canCreate = mode === 'ai' ? !!preview : !!title.trim();

  return (
    <Modal open={open} onClose={handleClose} title="New Checklist" width="max-w-lg">
      <div className="flex flex-col gap-5">

        {/* Mode toggle */}
        <div className="flex rounded-xl p-1 gap-1" style={{ background: 'var(--surface-2)' }}>
          {([['ai', '✨ Ask AI'], ['manual', '🔨 Build It']] as [Mode, string][]).map(([m, label]) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all"
              style={{
                background: mode === m ? 'var(--surface)' : 'transparent',
                color: mode === m ? 'var(--text)' : 'var(--text-3)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* AI mode */}
        {mode === 'ai' && (
          <div className="flex flex-col gap-4">
            {!preview ? (
              <>
                <div>
                  <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>
                    What are you trying to accomplish?
                  </label>
                  <textarea
                    className="w-full rounded-xl px-4 py-3 text-[13px] resize-none outline-none"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', minHeight: '110px' }}
                    placeholder="e.g. We're shooting vacation content in Miami this week. Need beachwear looks, a hotel GRWM, restaurant vlog, and a Skims brand deal..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                  />
                </div>
                {aiError && <p className="text-[12px]" style={{ color: 'var(--red)' }}>{aiError}</p>}
                <Button onClick={handleGenerate} loading={generating} disabled={!aiPrompt.trim()}>
                  <Sparkles size={14} />
                  {generating ? 'Generating...' : 'Generate Checklist'}
                </Button>
              </>
            ) : (
              <div className="flex flex-col gap-4">
                <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{preview.emoji}</span>
                    <div>
                      <p className="font-semibold text-[15px]" style={{ color: 'var(--text)' }}>{preview.title}</p>
                      {preview.description && (
                        <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>{preview.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 pt-1" style={{ borderTop: '1px solid var(--border)' }}>
                    {preview.items.map((item, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded mt-0.5 shrink-0" style={{ border: '1.5px solid var(--border)', background: 'var(--surface)' }} />
                        <span className="text-[13px]" style={{ color: 'var(--text-2)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPreview(null)}
                    className="flex-1 py-2.5 rounded-xl text-[13px] font-medium"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                  >
                    Regenerate
                  </button>
                  <Button onClick={handleCreate} loading={createChecklist.isPending} className="flex-1">
                    Create Checklist
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual mode */}
        {mode === 'manual' && (
          <div className="flex flex-col gap-4">
            {/* Emoji + Title */}
            <div className="flex gap-3">
              <div>
                <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>Icon</label>
                <select
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-xl outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                >
                  {EMOJI_OPTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>Title</label>
                <input
                  className="w-full rounded-xl px-4 py-2.5 text-[14px] outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="e.g. Miami Vacation Shoot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <label className="font-mono text-[9px] tracking-[2px] uppercase mb-2 block" style={{ color: 'var(--text-3)' }}>
                Checklist Items
              </label>
              <div className="flex flex-col gap-1.5 mb-2">
                {items.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div className="w-4 h-4 rounded shrink-0" style={{ border: '1.5px solid var(--border)' }} />
                    <span className="flex-1 text-[13px]" style={{ color: 'var(--text)' }}>{item}</span>
                    <button onClick={() => removeItem(i)}>
                      <X size={12} style={{ color: 'var(--text-3)' }} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  ref={itemInputRef}
                  className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
                  placeholder="Add an item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={onItemKeyDown}
                />
                <button
                  onClick={addItem}
                  className="px-3 rounded-xl"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  <Plus size={15} />
                </button>
              </div>
            </div>

            <Button onClick={handleCreate} loading={createChecklist.isPending} disabled={!canCreate}>
              Create Checklist
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
