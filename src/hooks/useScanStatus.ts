'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface ScanStatus {
  isScanning: boolean;
  runCount:   number;
  startedAt:  string | null;
}

export function useScanStatus() {
  const [status, setStatus] = useState<ScanStatus>({ isScanning: false, runCount: 0, startedAt: null });
  const supabase = createClient();

  const check = useCallback(async () => {
    const { data } = await supabase
      .from('scrape_runs')
      .select('id, status, created_at')
      .in('status', ['queued', 'running'])
      .order('created_at', { ascending: false });

    const active = data ?? [];
    setStatus({
      isScanning: active.length > 0,
      runCount:   active.length,
      startedAt:  active[0]?.created_at ?? null,
    });
    return active.length > 0;
  }, []);

  useEffect(() => {
    check();
    // Poll every 6s while potentially scanning; slow down to 30s when idle
    let interval: ReturnType<typeof setInterval>;

    const schedule = (fast: boolean) => {
      clearInterval(interval);
      interval = setInterval(async () => {
        const stillScanning = await check();
        if (!stillScanning) schedule(false);
        else if (!fast) schedule(true);
      }, fast ? 6000 : 30000);
    };

    schedule(true); // start fast, will slow down once scan completes
    return () => clearInterval(interval);
  }, [check]);

  return status;
}
