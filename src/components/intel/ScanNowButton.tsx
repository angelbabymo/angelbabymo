'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Radar } from 'lucide-react';

export function ScanNowButton() {
  const qc = useQueryClient();
  const [loading, setLoading] = useState(false);

  return (
    <button
      onClick={async () => {
        setLoading(true);
        const res = await fetch('/api/scan/manual', { method: 'POST' });
        const j = await res.json();
        if (!res.ok) alert(j.message || 'Scan failed');
        else qc.invalidateQueries({ queryKey: ['intel-scores'] });
        setLoading(false);
      }}
      disabled={loading}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50 transition-all"
      style={{ background: loading ? 'var(--surface-2)' : 'var(--red)' }}
    >
      <Radar size={13} className={loading ? 'animate-spin' : ''} />
      {loading ? 'Scanning…' : 'Scan Now'}
    </button>
  );
}
