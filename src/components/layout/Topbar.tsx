'use client';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

const ROUTE_LABELS: Record<string, string> = {
  '/database':    'Content Database',
  '/generator':   'AI Generator',
  '/performance': 'Performance',
  '/calendar':    'Content Calendar',
  '/vault':       'Idea Vault',
};

export function Topbar() {
  const pathname = usePathname();
  const router   = useRouter();
  const label    = Object.entries(ROUTE_LABELS).find(([k]) => pathname.startsWith(k))?.[1] ?? 'Dashboard';

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header
      style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}
      className="h-14 px-8 flex items-center justify-between shrink-0"
    >
      <div>
        <h1 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
          {label.toUpperCase()}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <div
          className="font-mono text-[10px] tracking-widest uppercase"
          style={{ color: 'var(--text-3)' }}
        >
          {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
        <button
          onClick={handleSignOut}
          style={{ color: 'var(--text-3)', border: '1px solid var(--border)' }}
          className="p-2 rounded-lg hover:text-[#fafafa] hover:border-[#3f3f46] transition-all"
          aria-label="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
