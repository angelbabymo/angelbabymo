'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Radar } from 'lucide-react';
import { useScanStatus } from '@/hooks/useScanStatus';

export function ScanNowButton() {
  const qc = useQueryClient();
  const { isScanning } = useScanStatus();
  const [starting, setStarting] = useState(false);

  const handleScan = async () => {
    if (isScanning || starting) return;
    setStarting(true);
    try {
      const res = await fetch('/api/scan/manual', { method: 'POST' });
      const j   = await res.json();
      if (!res.ok) alert(j.message || 'Scan failed');
      else qc.invalidateQueries({ queryKey: ['intel-scores'] });
    } finally {
      setStarting(false);
    }
  };

  const busy = isScanning || starting;

  return (
    <button
      onClick={handleScan}
      disabled={busy}
      className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-70 transition-all"
      style={{ background: busy ? 'var(--surface-2)' : 'var(--red)' }}
    >
      <Radar size={13} style={{ color: busy ? 'var(--red)' : 'white' }} className={busy ? 'animate-spin' : ''} />
      <span style={{ color: busy ? 'var(--red)' : 'white' }}>
        {busy ? 'Scanning…' : 'Scan Now'}
      </span>
    </button>
  );
}
