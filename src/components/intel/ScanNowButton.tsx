'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Radar, AlertCircle, X } from 'lucide-react';
import { useScanStatus } from '@/hooks/useScanStatus';

export function ScanNowButton() {
  const qc = useQueryClient();
  const { isScanning } = useScanStatus();
  const [starting, setStarting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScan = async () => {
    if (isScanning || starting) return;
    setStarting(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/scan/manual', { method: 'POST' });
      const j   = await res.json();
      if (!res.ok) {
        setErrorMsg(j.message ?? 'Scan failed');
      } else {
        qc.invalidateQueries({ queryKey: ['intel-scores'] });
      }
    } catch {
      setErrorMsg('Could not reach the server. Check your connection.');
    } finally {
      setStarting(false);
    }
  };

  const busy = isScanning || starting;

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        onClick={handleScan}
        disabled={busy}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-70 transition-all"
        style={{
          background: busy ? 'var(--surface-2)' : 'var(--red)',
          color: busy ? 'var(--red)' : 'white',
          border: busy ? '1px solid rgba(255,60,110,0.3)' : 'none',
        }}
      >
        <Radar size={13} className={busy ? 'animate-spin' : ''} />
        {busy ? 'Scanning…' : 'Scan Now'}
      </button>

      {errorMsg && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-[12px] max-w-[280px]"
          style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,60,110,0.25)', color: 'var(--red)' }}
        >
          <AlertCircle size={13} className="shrink-0 mt-0.5" />
          <span className="flex-1 leading-relaxed">{errorMsg}</span>
          <button onClick={() => setErrorMsg(null)} className="shrink-0">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
