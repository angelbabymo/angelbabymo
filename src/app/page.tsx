import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function Root() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) redirect('/database');

  // Unauthenticated — return 200 so OG scrapers (iMessage, etc.) can read meta tags
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ background: 'var(--bg)' }}>
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.25,
        }}
      />
      {/* Red ambient glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(255,60,110,0.07) 0%, transparent 100%)' }}
      />

      <div className="relative flex flex-col items-center gap-8 max-w-xs text-center">
        <div>
          <h1 className="font-display tracking-widest text-5xl leading-none" style={{ color: 'var(--text)' }}>
            CREATOR<span style={{ color: 'var(--red)' }}>OS</span>
          </h1>
          <p className="font-mono text-[10px] tracking-[4px] uppercase mt-2" style={{ color: 'var(--text-3)' }}>
            Private Content Operations · Lite
          </p>
        </div>

        <div className="w-12 h-px" style={{ background: 'var(--red)', opacity: 0.4 }} />

        <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Your private TikTok content dashboard — schedule, generate, and track your creator ops.
        </p>

        <Link
          href="/login"
          className="inline-flex items-center justify-center px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all"
          style={{ background: 'var(--red)', border: '1px solid var(--red)' }}
        >
          Sign In
        </Link>

        <p className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
          Authorized users only
        </p>
      </div>
    </div>
  );
}
