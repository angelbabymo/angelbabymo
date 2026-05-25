'use client';
import { useEffect, useState, KeyboardEvent } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { createNiche, updateNiche, deleteNiche } from '@/app/actions/brands';
import { ArrowLeft, Plus, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import Link from 'next/link';

export default function NichesPage() {
  const { slug } = useParams<{ slug: string }>();
  const [brand, setBrand]   = useState<any>(null);
  const [niches, setNiches] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [adding, setAdding]   = useState(false);
  const supabase = createClient();

  const load = async () => {
    const { data: b } = await supabase.from('brands').select('*').eq('slug', slug).single();
    if (!b) return;
    setBrand(b);
    const { data: n } = await supabase.from('niches').select('*').eq('brand_id', b.id).order('created_at');
    setNiches(n ?? []);
  };

  useEffect(() => { load(); }, [slug]);

  const handleAddNiche = async () => {
    if (!newName.trim() || !brand) return;
    setAdding(true);
    await createNiche(brand.id, newName.trim(), []);
    setNewName('');
    await load();
    setAdding(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this niche?')) return;
    await deleteNiche(id);
    await load();
  };

  const handleToggle = async (n: any) => {
    await updateNiche(n.id, { enabled: !n.enabled });
    await load();
  };

  if (!brand) return <div className="py-16 text-center" style={{ color: 'var(--text-3)' }}>Loading…</div>;

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">
      <div className="flex items-center gap-3">
        <Link href={`/brands/${slug}`} className="p-2 rounded-lg" style={{ color: 'var(--text-3)', background: 'var(--surface)', border: '1px solid var(--border)' }}>
          <ArrowLeft size={15} />
        </Link>
        <div>
          <h1 className="font-semibold text-[18px]" style={{ color: 'var(--text)' }}>Niches & Keywords</h1>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>{brand.name}</p>
        </div>
      </div>

      {/* Add niche */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl px-4 py-2.5 text-[13px] outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
          placeholder="Niche name, e.g. All Pillars"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddNiche()}
        />
        <button onClick={handleAddNiche} disabled={adding || !newName.trim()}
          className="px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white disabled:opacity-50"
          style={{ background: 'var(--red)' }}>
          <Plus size={14} />
        </button>
      </div>

      {/* Niches list */}
      <div className="flex flex-col gap-3">
        {niches.map(n => (
          <NicheCard key={n.id} niche={n} onDelete={() => handleDelete(n.id)} onToggle={() => handleToggle(n)} onUpdate={load} />
        ))}
      </div>
    </div>
  );
}

function NicheCard({ niche, onDelete, onToggle, onUpdate }: { niche: any; onDelete: () => void; onToggle: () => void; onUpdate: () => void }) {
  const [keywords, setKeywords] = useState<string[]>(niche.keywords ?? []);
  const [input, setInput]       = useState('');
  const [saving, setSaving]     = useState(false);

  const addKeyword = async () => {
    const kw = input.trim().toLowerCase();
    if (!kw || keywords.includes(kw)) return;
    const next = [...keywords, kw];
    setKeywords(next);
    setInput('');
    setSaving(true);
    await updateNiche(niche.id, { keywords: next });
    setSaving(false);
    onUpdate();
  };

  const removeKeyword = async (kw: string) => {
    const next = keywords.filter(k => k !== kw);
    setKeywords(next);
    await updateNiche(niche.id, { keywords: next });
    onUpdate();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } };

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)', opacity: niche.enabled ? 1 : 0.6 }}>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-[14px]" style={{ color: 'var(--text)' }}>{niche.name}</p>
        <div className="flex items-center gap-2">
          <button onClick={onToggle} style={{ color: niche.enabled ? 'var(--red)' : 'var(--text-3)' }}>
            {niche.enabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
          </button>
          <button onClick={onDelete} style={{ color: 'var(--text-3)' }}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Keywords */}
      <div className="flex flex-wrap gap-1.5">
        {keywords.map(kw => (
          <span key={kw} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
            {kw}
            <button onClick={() => removeKeyword(kw)} style={{ color: 'var(--text-3)' }}><X size={9} /></button>
          </span>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 rounded-xl px-3 py-2 text-[12px] outline-none"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
          placeholder="Add keyword…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />
        <button onClick={addKeyword} disabled={!input.trim() || saving}
          className="px-3 py-2 rounded-xl text-[12px] font-medium disabled:opacity-50"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
