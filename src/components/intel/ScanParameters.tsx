'use client';
import { useEffect, useState, KeyboardEvent } from 'react';
import { createClient } from '@/lib/supabase/client';
import { createNiche, updateNiche, deleteNiche } from '@/app/actions/brands';
import { Plus, X, ChevronDown, ChevronUp, ToggleLeft, ToggleRight, Search, Trash2 } from 'lucide-react';

interface Props {
  brandId: string;
}

export function ScanParameters({ brandId }: Props) {
  const [niches, setNiches]     = useState<any[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [newName, setNewName]   = useState('');
  const [adding, setAdding]     = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data } = await supabase
      .from('niches')
      .select('*')
      .eq('brand_id', brandId)
      .order('created_at');
    setNiches(data ?? []);
  };

  useEffect(() => { load(); }, [brandId]);

  // Auto-expand if no niches so user immediately sees the setup prompt
  useEffect(() => {
    if (niches.length === 0) setExpanded(true);
  }, [niches.length]);

  const handleAdd = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    await createNiche(brandId, name, []);
    setNewName('');
    await load();
    setAdding(false);
  };

  const handleToggle = async (n: any) => {
    await updateNiche(n.id, { enabled: !n.enabled });
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this niche?')) return;
    await deleteNiche(id);
    await load();
  };

  const allKeywords = niches.filter(n => n.enabled).flatMap((n: any) => n.keywords ?? []);
  const enabledCount = niches.filter(n => n.enabled).length;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>

      {/* Header row — always visible */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3"
        style={{ textAlign: 'left' }}
      >
        <div style={{
          width: 30, height: 30, borderRadius: 9, flexShrink: 0,
          background: enabledCount > 0 ? 'rgba(255,60,110,0.12)' : 'var(--surface-2)',
          border: `1px solid ${enabledCount > 0 ? 'rgba(255,60,110,0.3)' : 'var(--border)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Search size={13} style={{ color: enabledCount > 0 ? 'var(--red)' : 'var(--text-3)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
            Scan Parameters
          </p>
          <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
            {niches.length === 0
              ? 'No niches configured — tap to set up'
              : enabledCount === 0
                ? `${niches.length} niche${niches.length !== 1 ? 's' : ''}, none enabled`
                : `${enabledCount} active · ${allKeywords.length} keyword${allKeywords.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>

        {/* Keyword pills preview when collapsed */}
        {!expanded && allKeywords.length > 0 && (
          <div className="hidden sm:flex items-center gap-1 flex-wrap" style={{ maxWidth: 180 }}>
            {allKeywords.slice(0, 3).map((kw: string) => (
              <span key={kw} style={{
                fontSize: 10, padding: '2px 7px', borderRadius: 5, fontWeight: 600,
                background: 'rgba(255,60,110,0.1)', color: 'var(--red)',
              }}>
                {kw}
              </span>
            ))}
            {allKeywords.length > 3 && (
              <span style={{ fontSize: 10, color: 'var(--text-3)' }}>+{allKeywords.length - 3}</span>
            )}
          </div>
        )}

        {expanded
          ? <ChevronUp size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          : <ChevronDown size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
        }
      </button>

      {/* Expanded content */}
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 16px 16px' }}>

          {niches.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-4 text-center mb-4">
              <Search size={22} style={{ color: 'var(--text-3)' }} />
              <p style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600 }}>
                No niches set up yet
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-3)', maxWidth: 260, lineHeight: 1.5 }}>
                Niches tell the scanner what TikTok products to find. Add one below — e.g. "Fashion", "Shoes", "Skincare".
              </p>
            </div>
          )}

          {/* Niche list */}
          <div className="flex flex-col gap-3 mb-3">
            {niches.map(n => (
              <NicheRow
                key={n.id}
                niche={n}
                onToggle={() => handleToggle(n)}
                onDelete={() => handleDelete(n.id)}
                onUpdate={load}
              />
            ))}
          </div>

          {/* Add niche */}
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder='Add niche — e.g. "Shoes" or "Skincare"'
              style={{
                flex: 1, borderRadius: 10, padding: '9px 12px',
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                color: 'var(--text)', fontSize: 13, outline: 'none',
              }}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !newName.trim()}
              style={{
                padding: '9px 14px', borderRadius: 10,
                background: 'var(--red)', color: '#fff',
                fontSize: 13, fontWeight: 600,
                opacity: adding || !newName.trim() ? 0.5 : 1,
              }}
            >
              <Plus size={15} />
            </button>
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

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addKeyword(); }
  };

  return (
    <div
      className="rounded-xl p-3 flex flex-col gap-2"
      style={{
        background: 'var(--surface-2)',
        border: `1px solid ${niche.enabled ? 'rgba(255,60,110,0.2)' : 'var(--border)'}`,
        opacity: niche.enabled ? 1 : 0.6,
      }}
    >
      {/* Niche header */}
      <div className="flex items-center justify-between gap-2">
        <p style={{ fontSize: 13, fontWeight: 700, color: niche.enabled ? 'var(--text)' : 'var(--text-3)' }}>
          {niche.name}
        </p>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} style={{ color: niche.enabled ? 'var(--red)' : 'var(--text-3)', flexShrink: 0 }}>
            {niche.enabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          </button>
          <button onClick={onDelete} style={{ color: 'var(--text-3)', flexShrink: 0 }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Keywords */}
      {keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.map(kw => (
            <span
              key={kw}
              className="flex items-center gap-1"
              style={{
                padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: niche.enabled ? 'rgba(255,60,110,0.1)' : 'var(--surface-3)',
                color: niche.enabled ? 'var(--red)' : 'var(--text-3)',
                border: `1px solid ${niche.enabled ? 'rgba(255,60,110,0.2)' : 'var(--border)'}`,
              }}
            >
              {kw}
              <button onClick={() => removeKeyword(kw)} style={{ opacity: 0.7 }}>
                <X size={9} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Add keyword */}
      <div className="flex gap-1.5">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Add keyword…"
          style={{
            flex: 1, borderRadius: 7, padding: '5px 9px',
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            color: 'var(--text)', fontSize: 12, outline: 'none',
          }}
        />
        <button
          onClick={addKeyword}
          disabled={!input.trim()}
          style={{
            padding: '5px 9px', borderRadius: 7,
            background: 'var(--surface-3)', border: '1px solid var(--border)',
            color: 'var(--text-3)', opacity: !input.trim() ? 0.4 : 1,
          }}
        >
          <Plus size={12} />
        </button>
      </div>

      {keywords.length === 0 && (
        <p style={{ fontSize: 11, color: 'var(--text-3)', fontStyle: 'italic' }}>
          No keywords yet — add some above so the scanner knows what to find
        </p>
      )}
    </div>
  );
}
