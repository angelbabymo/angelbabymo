'use client';
import { useState } from 'react';
import { useClips } from '@/hooks/useClips';
import { ClipTable } from '@/components/database/ClipTable';
import { AddClipModal } from '@/components/database/AddClipModal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { Plus, Search, Filter } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';

export default function DatabasePage() {
  const { data: clips = [], isLoading } = useClips();
  const setAddClipOpen = useUIStore((s) => s.setAddClipOpen);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('');

  const filtered = clips.filter((c) => {
    const matchesSearch = !search || c.clip_name.toLowerCase().includes(search.toLowerCase());
    const matchesCat    = !filterCat || c.category === filterCat;
    return matchesSearch && matchesCat;
  });

  const totalViews = clips.reduce((a, c) => a + c.views, 0);
  const totalSaves = clips.reduce((a, c) => a + c.saves, 0);
  const avgWatch   = clips.length ? Math.round(clips.reduce((a, c) => a + c.watch_time_pct, 0) / clips.length) : 0;

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
            {clips.length} clips tracked
          </p>
        </div>
        <Button onClick={() => setAddClipOpen(true)}>
          <Plus size={14} /> Add Clip
        </Button>
      </div>

      {/* Summary stats */}
      {clips.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Views"    value={formatNumber(totalViews)} color="var(--text)" />
          <StatCard label="Total Saves"    value={formatNumber(totalSaves)} color="var(--red)" />
          <StatCard label="Avg Watch Time" value={`${avgWatch}%`}          color="var(--cyan)" />
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-3)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clips..."
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)' }}
            className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg outline-none focus:border-[var(--border-2)] placeholder:text-[var(--text-3)]"
          />
        </div>
        <select
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: filterCat ? 'var(--text)' : 'var(--text-3)' }}
          className="px-3 py-2 text-[13px] rounded-lg outline-none cursor-pointer focus:border-[var(--border-2)]"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <ClipTable clips={filtered} />
      )}

      <AddClipModal />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
        {label}
      </div>
      <div className="font-mono text-2xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="card h-16 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  );
}
