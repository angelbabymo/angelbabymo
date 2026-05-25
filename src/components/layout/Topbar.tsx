'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Radar } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ProfileSwitcher } from '@/components/brand/ProfileSwitcher';
import { useScanStatus } from '@/hooks/useScanStatus';
import Link from 'next/link';

const ROUTE_LABELS: Record<string, string> = {
  '/database':    'Content DB',
  '/generator':   'AI Generator',
  '/performance': 'Performance',
  '/calendar':    'Calendar',
  '/vault':       'Idea Vault',
};

export function Topbar() {
  const pathname         = usePathname();
  const router           = useRouter();
  const label            = Object.entries(ROUTE_LABELS).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';
  const { isScanning }   = useScanStatus();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header
      style={{
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        paddingTop: 'calc(env(safe-area-inset-top) + 10px)',
        paddingBottom: 10,
        position: 'relative',
        zIndex: 50,
        overflow: 'visible',
      }}
      className="px-4 md:px-8 flex items-center justify-between shrink-0"
    >
      {/* Left: brand switcher / page title */}
      <div className="flex items-center gap-3">
        <div className="md:hidden">
          <ProfileSwitcher />
        </div>
        <h1 className="font-display tracking-widest text-lg hidden md:block" style={{ color: 'var(--text)' }}>
          {label.toUpperCase()}
        </h1>
      </div>

      {/* Right: scan indicator + date + sign out */}
      <div className="flex items-center gap-3">
        {/* Global scan indicator — visible on every page while scanning */}
        {isScanning && (
          <Link
            href="/intel"
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              borderRadius: 8,
              background: 'rgba(255,60,110,0.12)',
              border: '1px solid rgba(255,60,110,0.3)',
              color: 'var(--red)',
              fontSize: 11, fontWeight: 600,
              animation: 'fadeIn 0.3s ease both',
            }}
          >
            <Radar size={11} className="animate-spin" />
            Scanning…
          </Link>
        )}

        <div className="hidden sm:block font-mono text-[10px] tracking-widest uppercase" style={{ color: 'var(--text-3)' }}>
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button
          onClick={handleSignOut}
          style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
          className="p-2 rounded-lg transition-all active:opacity-60"
          aria-label="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
