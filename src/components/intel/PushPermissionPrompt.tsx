'use client';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

export function PushPermissionPrompt() {
  const [state, setState] = useState<'idle' | 'granted' | 'denied' | 'loading'>('idle');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setState(Notification.permission === 'granted' ? 'granted' : 'idle');
    }
  }, []);

  if (state === 'granted') return null;

  return (
    <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-4 text-[13px]"
      style={{ background: 'rgba(255,60,110,0.08)', border: '1px solid rgba(255,60,110,0.2)' }}>
      <div className="flex items-center gap-2" style={{ color: 'var(--text-2)' }}>
        <Bell size={14} style={{ color: 'var(--red)' }} />
        Get notified when a product scores 8+
      </div>
      <button
        disabled={state === 'loading'}
        onClick={async () => {
          setState('loading');
          const perm = await Notification.requestPermission();
          if (perm !== 'granted') { setState('denied'); return; }
          try {
            const reg = await navigator.serviceWorker.register('/sw.js');
            const sub = await reg.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
            });
            await fetch('/api/push/subscribe', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ endpoint: sub.endpoint, keys: sub.toJSON().keys, userAgent: navigator.userAgent }),
            });
            setState('granted');
          } catch { setState('idle'); }
        }}
        className="px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50"
        style={{ background: 'var(--red)' }}
      >
        {state === 'loading' ? 'Enabling…' : 'Enable'}
      </button>
    </div>
  );
}
