'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Zap, Calendar, CheckSquare, TrendingUp, Activity } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/intel',      icon: TrendingUp,  label: 'Intel' },
  { href: '/database',   icon: Database,    label: 'Content' },
  { href: '/generator',  icon: Zap,         label: 'Generate' },
  { href: '/checklists', icon: CheckSquare, label: 'Tasks' },
  { href: '/ai',         icon: Activity,    label: 'AI' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex md:hidden"
      style={{
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex-1 flex flex-col items-center gap-1 py-3 transition-all active:opacity-60"
            style={{ color: active ? 'var(--red)' : 'var(--text-3)' }}
          >
            <Icon size={20} strokeWidth={active ? 2.5 : 2} />
            <span className="font-mono text-[9px] tracking-wide uppercase">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
