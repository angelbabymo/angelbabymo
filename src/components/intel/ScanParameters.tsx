'use client';
import { useEffect, useState, KeyboardEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createNiche, updateNiche, deleteNiche } from '@/app/actions/brands';
import { Plus, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Search, Trash2, Sparkles, Loader2 } from 'lucide-react';

interface Props { brandId: string }

export function ScanParameters({ brandId }: Props) {
  const [niches, setNiches]       = useState<any[]>([]);
  const [expanded, setExpanded]   = useState(false);
  const [mode, setMode]               = useState<'ai' | 'manual'>('ai');
  const [description, setDescription] = useState('');
  const [generating, setGenerating]   = useState(false);
  const [preview, setPreview]     = useState<{ name: string; keywords: string[] } | null>(null);
  const [error, setError]         = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [manualName, setManualName]   = useState('');
  const [manualKeywords, setManualKeywords] = useState('');
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase.from('niches').select('*').eq('brand_id', brandId).order('created_at');
    setNiches(data ?? []);
  };

  useEffect(() => { load(); }, [brandId]);
  useEffect(() => { if (niches.length === 0) setExpanded(true); }, [niches.length]);

  const handleGenerate = async () => {
    if (!description.trim() || generating) return;
    setGenerating(true);
    setError(null);
    setPreview(null);
    try {
      const res = await fetch('/api/niches/generate-keywords', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ description }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error ?? 'Generation failed');
      setPreview(j);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!preview) return;
    setSaving(true);
    await createNiche(brandId, preview.name, preview.keywords);
    setPreview(null);
    setDescription('');
    await load();
    setSaving(false);
  };

  const handleToggle = async (n: any) => { await updateNiche(n.id, { enabled: !n.enabled }); await load(); };
  const handleDelete = async (id: string) => { if (!confirm('Delete this niche?')) return; await deleteNiche(id); await load(); };

  const allKeywords  = niches.filter(n => n.enabled).flatMap((n: any) => n.keywords ?? []);
  const enabledCount = niches.filter(n => n.enabled).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Collapsed header */}
      <button onClick={() => setExpanded(e => !e)} className="w-full flex items-center gap-3 px-4 py-3" style={{ textAlign: 'left' }}>
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: enabledCount > 0 ? 'rgba(255,60,110,0.12)' : 'var(--surface-2)',
          border: `1px solid ${enabledCount > 0 ? 'rgba(255,60,110,0.3)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Search size={13} style={{ color: enabledCount > 0 ? 'var(--red)' : 'var(--text-3)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>Scan Parameters</p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {niches.length === 0
              ? 'No niches configured — tap to set up'
              : enabledCount === 0
                ? `${niches.length} niche${niches.length !== 1 ? 's' : ''}, none enabled`
                : `${enabledCount} active · ${allKeywords.length} keyword${allKeywords.length !== 1 ? 's' : ''}`}
          </p>
        </div>

        {!expanded && allKeywords.length > 0 && (
          <div className="hidden sm:flex items-center gap-1">
            {allKeywords.slice(0, 3).map((kw: string) => (
              <span key={kw} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600, background: 'rgba(255,60,110,0.1)', color: 'var(--red)' }}>
                {kw}
              </span>
            ))}
            {allKeywords.length > 3 && <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{allKeywords.length - 3}</span>}
          </div>
        )}
        {expanded ? <ChevronUp size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} /> : <ChevronDown size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />}
      </button>

      {/* Expanded */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* Existing niches */}
          {niches.length > 0 && (
            <div className="flex flex-col gap-2">
              {niches.map(n => (
                <NicheRow key={n.id} niche={n} onToggle={() => handleToggle(n)} onDelete={() => handleDelete(n.id)} onUpdate={load} />
              ))}
            </div>
          )}

          {/* Add niche panel */}
          <div style={{ borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--border)', overflow: 'hidden' }}>

            {/* Mode tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
              {([['ai', '✦ Generate with AI', '~$0.001'] , ['manual', '✎ Paste Your Own', 'Free']] as const).map(([m, label, badge]) => (
                <button
                  key={m}
                  onClick={() => { setMode(m); setPreview(null); setError(null); }}
                  style={{
                    flex: 1, padding: '10px 8px',
                    fontSize: 12, fontWeight: 700,
                    background: mode === m ? 'var(--surface)' : 'transparent',
                    color: mode === m ? 'var(--text)' : 'var(--text-3)',
                    borderRight: m === 'ai' ? '1px solid var(--border)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {label}
                  <span style={{
                    fontSize: 9, padding: '1px 5px', borderRadius: 4, fontFamily: 'monospace',
                    background: mode === m ? (m === 'ai' ? 'rgba(255,60,110,0.12)' : 'rgba(34,197,94,0.12)') : 'var(--surface-3)',
                    color: mode === m ? (m === 'ai' ? 'var(--red)' : '#22c55e') : 'var(--text-3)',
                  }}>
                    {badge}
                  </span>
                </button>
              ))}
            </div>

            <div style={{ padding: 14 }}>
              {mode === 'ai' ? (
                <>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
                    Describe your niche — Claude generates optimized TikTok Shop search keywords.
                  </p>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={'e.g. "Soft luxury feminine fashion and accessories for women 18-35 who love clean-girl aesthetic style"'}
                    rows={3}
                    style={{
                      width: '100%', borderRadius: 10, padding: '10px 12px',
                      background: 'var(--surface-3)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.5,
                    }}
                  />
                  {error && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 6 }}>{error}</p>}

                  {preview ? (
                    <div style={{ marginTop: 10, padding: 12, borderRadius: 10, background: 'var(--surface)', border: '1px solid rgba(255,60,110,0.25)' }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>"{preview.name}"</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 10 }}>
                        {preview.keywords.map(kw => (
                          <span key={kw} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 6, fontWeight: 600, background: 'rgba(255,60,110,0.1)', color: 'var(--red)', border: '1px solid rgba(255,60,110,0.2)' }}>
                            {kw}
                          </span>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleSave} disabled={saving} style={{ flex: 1, padding: '8px 0', borderRadius: 9, background: 'var(--red)', color: '#fff', fontSize: 12, fontWeight: 700, opacity: saving ? 0.6 : 1 }}>
                          {saving ? 'Saving…' : 'Save Niche'}
                        </button>
                        <button onClick={() => { setPreview(null); setDescription(''); }} style={{ padding: '8px 12px', borderRadius: 9, background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)', fontSize: 12 }}>
                          Discard
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !description.trim()}
                      style={{
                        marginTop: 8, width: '100%', padding: '9px 0', borderRadius: 10,
                        background: description.trim() ? 'var(--red)' : 'var(--surface-3)',
                        color: description.trim() ? '#fff' : 'var(--text-3)',
                        fontSize: 13, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}
                    >
                      {generating ? <><Loader2 size={13} className="animate-spin" /> Generating…</> : <><Sparkles size={13} /> Generate Keywords</>}
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p style={{ fontSize: 11, color: 'var(--text-3)', marginBottom: 8, lineHeight: 1.5 }}>
                    Paste keywords from Claude.ai or anywhere else. One keyword per line, or comma-separated.
                  </p>
                  <input
                    value={manualName}
                    onChange={e => setManualName(e.target.value)}
                    placeholder="Niche name — e.g. Soft Luxury Fashion"
                    style={{
                      width: '100%', borderRadius: 10, padding: '9px 12px', marginBottom: 8,
                      background: 'var(--surface-3)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 13, outline: 'none',
                    }}
                  />
                  <textarea
                    value={manualKeywords}
                    onChange={e => setManualKeywords(e.target.value)}
                    placeholder={'Paste keywords here — one per line or comma-separated:\nsoft luxury outfit\nfeminine fashion haul\naesthetic clothing\nquiet luxury fashion'}
                    rows={4}
                    style={{
                      width: '100%', borderRadius: 10, padding: '10px 12px',
                      background: 'var(--surface-3)', border: '1px solid var(--border)',
                      color: 'var(--text)', fontSize: 13, resize: 'none', outline: 'none', lineHeight: 1.6,
                    }}
                  />
                  <button
                    onClick={async () => {
                      const name = manualName.trim();
                      const keywords = manualKeywords
                        .split(/[\n,]+/)
                        .map(k => k.trim().toLowerCase())
                        .filter(Boolean);
                      if (!name || !keywords.length) return;
                      setSaving(true);
                      await createNiche(brandId, name, keywords);
                      setManualName('');
                      setManualKeywords('');
                      await load();
                      setSaving(false);
                    }}
                    disabled={saving || !manualName.trim() || !manualKeywords.trim()}
                    style={{
                      marginTop: 8, width: '100%', padding: '9px 0', borderRadius: 10,
                      background: manualName.trim() && manualKeywords.trim() ? 'var(--red)' : 'var(--surface-3)',
                      color: manualName.trim() && manualKeywords.trim() ? '#fff' : 'var(--text-3)',
                      fontSize: 13, fontWeight: 700,
                      opacity: saving ? 0.6 : 1,
                    }}
                  >
                    {saving ? 'Saving…' : 'Save Niche'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NicheRow({ niche, onToggle, onDelete, onUpdate }: {
  niche: any; onToggle: () => void; onDelete: () => void; onUpdate: () => void;
}) {
  const [keywords, setKeywords] = useState<string[]>(niche.keywords ?? []);
  const [input, setInput]       = useState('');

  const addKeyword = async () => {
    const kw = input.trim().toLowerCase();
    if (!kw || keywords.includes(kw)) return;
    const next = [...keywords, kw];
    setKeywords(next);
    setInput('');
    await updateNiche(niche.id, { keywords: next });
    onUpdate();
  };

  const removeKeyword = async (kw: string) => {
    const next = keywords.filter(k => k !== kw);
    setKeywords(next);
    await updateNiche(niche.id, { keywords: next });
    onUpdate();
  };

  return (
    <div style={{
      borderRadius: 12, padding: '10px 12px',
      background: 'var(--surface-2)',
      border: `1px solid ${niche.enabled ? 'rgba(255,60,110,0.2)' : 'var(--border)'}`,
      opacity: niche.enabled ? 1 : 0.55,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: keywords.length ? 8 : 0 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: niche.enabled ? 'var(--text)' : 'var(--text-3)' }}>{niche.name}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onToggle} style={{ color: niche.enabled ? 'var(--red)' : 'var(--text-3)' }}>
            {niche.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          <button onClick={onDelete} style={{ color: 'var(--text-3)' }}><Trash2 size={13} /></button>
        </div>
      </div>

      {keywords.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {keywords.map(kw => (
            <span key={kw} style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
              background: niche.enabled ? 'rgba(255,60,110,0.1)' : 'var(--surface-3)',
              color: niche.enabled ? 'var(--red)' : 'var(--text-3)',
              border: `1px solid ${niche.enabled ? 'rgba(255,60,110,0.2)' : 'var(--border)'}`,
            }}>
              {kw}
              <button onClick={() => removeKeyword(kw)}><X size={9} /></button>
            </span>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
          placeholder="Add keyword…"
          style={{
            flex: 1, borderRadius: 7, padding: '5px 9px',
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 12, outline: 'none',
          }}
        />
        <button onClick={addKeyword} disabled={!input.trim()} style={{
          padding: '5px 9px', borderRadius: 7,
          background: 'var(--surface-3)', border: '1px solid var(--border)',
          color: 'var(--text-3)', opacity: !input.trim() ? 0.4 : 1,
        }}>
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}
