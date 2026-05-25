'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Database, Zap, BarChart2, Calendar, Lightbulb, CheckSquare, TrendingUp, Tag, Activity } from 'lucide-react';
import { BrandSwitcherGlobal } from '@/components/brand/BrandSwitcherGlobal';

const NAV_ITEMS = [
  { href: '/intel',       icon: TrendingUp,   label: 'Product Intel' },
  { href: '/database',    icon: Database,     label: 'Content DB' },
  { href: '/generator',   icon: Zap,          label: 'AI Generator' },
  { href: '/ai',          icon: Activity,     label: 'AI Activity' },
  { href: '/performance', icon: BarChart2,    label: 'Performance' },
  { href: '/calendar',    icon: Calendar,     label: 'Calendar' },
  { href: '/checklists',  icon: CheckSquare,  label: 'Checklists' },
  { href: '/vault',       icon: Lightbulb,    label: 'Idea Vault' },
  { href: '/brands',      icon: Tag,          label: 'Brands' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
      className="w-[220px] shrink-0 hidden md:flex flex-col h-screen sticky top-0"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="font-display text-2xl tracking-widest leading-none" style={{ color: 'var(--text)' }}>
          CREATOR<span style={{ color: 'var(--red)' }}>OS</span>
        </div>
        <div className="font-mono text-[9px] tracking-[3px] mt-1 uppercase" style={{ color: 'var(--text-3)' }}>
          LITE · V1.0
        </div>
      </div>

      {/* Brand switcher */}
      <div style={{ borderBottom: '1px solid var(--border)' }} className="pb-1">
        <BrandSwitcherGlobal />
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-1">
        <div
          className="font-mono text-[9px] tracking-[2px] uppercase px-3 py-2"
          style={{ color: 'var(--text-3)' }}
        >
          Workspace
        </div>
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                background: active ? 'var(--red-dim)' : 'transparent',
                color: active ? 'var(--red)' : 'var(--text-2)',
                border: active ? '1px solid rgba(255,60,110,0.2)' : '1px solid transparent',
              }}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 hover:bg-[#18181b] hover:text-[#fafafa]"
            >
              <Icon size={15} strokeWidth={active ? 2.5 : 2} />
              <span className="flex-1">{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ borderTop: '1px solid var(--border)' }} className="p-4">
        <div
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-3)' }}
          className="flex items-center gap-2 rounded-full px-3 py-2 text-[11px]"
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--green)' }} />
          Supabase · Connected
        </div>
      </div>
    </aside>
  );
}
