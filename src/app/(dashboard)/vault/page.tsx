'use client';
import { useState } from 'react';
import { useVault } from '@/hooks/useVault';
import { VaultGrid } from '@/components/vault/VaultGrid';
import { AddIdeaModal } from '@/components/vault/AddIdeaModal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { Plus } from 'lucide-react';
import { VAULT_TYPES } from '@/lib/constants';

export default function VaultPage() {
  const { data: items = [], isLoading } = useVault();
  const setAddIdeaOpen = useUIStore((s) => s.setAddIdeaOpen);
  const [filterType, setFilterType]   = useState('');
  const [filterUsed, setFilterUsed]   = useState<'all' | 'unused' | 'used'>('all');

  const filtered = items.filter((item) => {
    const matchType = !filterType || item.type === filterType;
    const matchUsed =
      filterUsed === 'all' ? true :
      filterUsed === 'unused' ? !item.is_used :
      item.is_used;
    return matchType && matchUsed;
  });

  const unusedCount = items.filter((i) => !i.is_used).length;
  const highCount   = items.filter((i) => i.priority === 'high' && !i.is_used).length;

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
            {items.length} ideas · {unusedCount} unused
            {highCount > 0 && (
              <span className="ml-2 font-mono text-[10px] font-bold" style={{ color: 'var(--red)' }}>
                {highCount} HIGH PRIORITY
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => setAddIdeaOpen(true)}>
          <Plus size={14} /> Add Idea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: filterType ? 'var(--text)' : 'var(--text-3)' }}
          className="px-3 py-2 text-[13px] rounded-lg outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          {VAULT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          {(['all', 'unused', 'used'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterUsed(v)}
              style={{
                background: filterUsed === v ? 'var(--surface-3)' : 'var(--surface)',
                color: filterUsed === v ? 'var(--text)' : 'var(--text-3)',
              }}
              className="px-4 py-2 text-[12px] font-medium capitalize transition-all"
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-32 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      ) : (
        <VaultGrid items={filtered} />
      )}

      <AddIdeaModal />
    </div>
  );
}
