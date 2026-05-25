'use client';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { switchBrand } from '@/app/actions/brands';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';

function brandColor(name: string) {
  const colors = ['#ff3c6e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#84cc16'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getCookieBrand(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/current_brand_slug=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export function BrandSwitcherGlobal({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [brands, setBrands]       = useState<any[]>([]);
  const [current, setCurrent]     = useState<any>(null);
  const [open, setOpen]           = useState(false);
  const [switching, setSwitching] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('brands')
        .select('id, name, slug, description')
        .eq('owner_user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      const list = data ?? [];
      setBrands(list);
      const slug = getCookieBrand();
      setCurrent(list.find(b => b.slug === slug) ?? list[0] ?? null);
    })();
  }, []);

  // Lock body scroll when sheet is open
  useEffect(() => {
    if (compact && open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [compact, open]);

  // Desktop: close on outside click
  useEffect(() => {
    if (compact) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [compact]);

  const handleSwitch = async (brand: any) => {
    if (brand.slug === current?.slug) { setOpen(false); return; }
    setSwitching(true);
    setOpen(false);
    setCurrent(brand);
    await switchBrand(brand.slug);
    router.refresh();
    setSwitching(false);
  };

  if (!brands.length) return null;

  /* ─────────────────────────────────────────────────────────────────────
     COMPACT (MOBILE) — Bottom Sheet
     Anchored to bottom: 0. Never goes off-screen. iOS-native pattern.
  ───────────────────────────────────────────────────────────────────── */
  if (compact) {
    const sheet = open && typeof document !== 'undefined'
      ? createPortal(
          <>
            {/* Backdrop */}
            <div
              onClick={() => setOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 9998,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                animation: 'fadeIn 0.2s ease',
              }}
            />

            {/* Sheet — slides up from bottom, always on screen */}
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 9999,
                background: 'var(--surface)',
                borderRadius: '20px 20px 0 0',
                paddingBottom: 'env(safe-area-inset-bottom)',
                animation: 'slideUp 0.28s cubic-bezier(0.32,0.72,0,1)',
              }}
            >
              {/* Handle + header */}
              <div style={{ padding: '12px 20px 8px', textAlign: 'center' }}>
                <div style={{
                  width: 36, height: 4, borderRadius: 2,
                  background: 'var(--border-2)',
                  margin: '0 auto 14px',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <p className="font-mono text-[10px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
                    Switch Brand
                  </p>
                  <button
                    onClick={() => setOpen(false)}
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <X size={13} style={{ color: 'var(--text-3)' }} />
                  </button>
                </div>
              </div>

              {/* Brand list */}
              <div style={{ padding: '4px 12px 8px' }}>
                {brands.map(b => {
                  const active = b.slug === current?.slug;
                  return (
                    <button
                      key={b.id}
                      onClick={() => handleSwitch(b)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '13px 12px',
                        borderRadius: 14,
                        background: active ? 'var(--red-dim)' : 'transparent',
                        border: `1px solid ${active ? 'rgba(255,60,110,0.25)' : 'transparent'}`,
                        marginBottom: 4,
                        textAlign: 'left',
                        transition: 'opacity 0.15s',
                      }}
                    >
                      <span style={{
                        width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                        background: brandColor(b.name), color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 14, fontWeight: 700,
                        boxShadow: `0 4px 12px ${brandColor(b.name)}55`,
                      }}>
                        {initials(b.name)}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontSize: 16, fontWeight: 600,
                          color: active ? 'var(--red)' : 'var(--text)',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {b.name}
                        </p>
                        {b.description && (
                          <p style={{
                            fontSize: 12, color: 'var(--text-3)', marginTop: 2,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {b.description}
                          </p>
                        )}
                      </div>
                      {active && (
                        <span style={{
                          width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                          background: 'var(--red)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <Check size={12} color="white" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Add brand */}
              <div style={{ padding: '0 12px 12px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={() => { setOpen(false); router.push('/brands/new'); }}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 12px',
                    borderRadius: 14,
                    background: 'transparent',
                    marginTop: 8,
                    textAlign: 'left',
                  }}
                >
                  <span style={{
                    width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                    background: 'var(--surface-2)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Plus size={18} style={{ color: 'var(--text-3)' }} />
                  </span>
                  <p style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-2)' }}>
                    Add New Brand
                  </p>
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      : null;

    return (
      <>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-xl transition-all active:opacity-70"
          style={{
            padding: '6px 10px',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
          }}
        >
          {current && (
            <span style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              background: brandColor(current.name), color: '#fff',
              fontSize: 9, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {initials(current.name)}
            </span>
          )}
          <span style={{
            fontSize: 13, fontWeight: 500,
            color: 'var(--text)', maxWidth: 110,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {current?.name ?? 'Select brand'}
          </span>
          <ChevronsUpDown size={11} style={{ color: 'var(--text-3)' }} />
        </button>
        {sheet}
      </>
    );
  }

  /* ─────────────────────────────────────────────────────────────────────
     FULL (DESKTOP SIDEBAR) — standard dropdown, works fine at this size
  ───────────────────────────────────────────────────────────────────── */
  return (
    <div ref={ref} className="relative px-3 pb-3">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 rounded-xl transition-all"
        style={{
          padding: '10px 12px',
          background: open ? 'var(--surface-2)' : 'transparent',
          border: `1px solid ${open ? 'var(--border-2)' : 'var(--border)'}`,
        }}
      >
        {current ? (
          <span style={{
            width: 28, height: 28, borderRadius: 8, flexShrink: 0,
            background: brandColor(current.name), color: '#fff',
            fontSize: 11, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {initials(current.name)}
          </span>
        ) : (
          <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--surface-3)', flexShrink: 0 }} />
        )}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {current?.name ?? 'No brand'}
          </p>
          <p style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>
            {switching ? 'Switching…' : `${brands.length} brand${brands.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <ChevronsUpDown size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </button>

      {open && (
        <div
          className="animate-[fadeUp_0.15s_ease_both]"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 12, right: 12,
            zIndex: 1000,
            background: 'var(--surface)',
            border: '1px solid var(--border-2)',
            borderRadius: 14,
            boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '8px 8px 4px' }}>
            <p className="font-mono text-[9px] tracking-[2px] uppercase"
              style={{ color: 'var(--text-3)', padding: '0 8px 6px' }}>
              Your Brands
            </p>
            {brands.map(b => {
              const active = b.slug === current?.slug;
              return (
                <button key={b.id} onClick={() => handleSwitch(b)}
                  className="w-full flex items-center gap-2.5 rounded-lg transition-all text-left"
                  style={{ padding: '8px 8px', background: active ? 'var(--red-dim)' : 'transparent' }}>
                  <span style={{
                    width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                    background: brandColor(b.name), color: '#fff',
                    fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {initials(b.name)}
                  </span>
                  <span style={{
                    flex: 1, fontSize: 13, fontWeight: 500,
                    color: active ? 'var(--red)' : 'var(--text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {b.name}
                  </span>
                  {active && (
                    <span style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      background: 'var(--red)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={9} color="white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '4px 8px 8px' }}>
            <button
              onClick={() => { setOpen(false); router.push('/brands/new'); }}
              className="w-full flex items-center gap-2.5 rounded-lg transition-all"
              style={{ padding: '8px 8px', color: 'var(--text-3)' }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                background: 'var(--surface-2)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Plus size={12} />
              </span>
              <span style={{ fontSize: 12, fontWeight: 500 }}>Add Brand</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
