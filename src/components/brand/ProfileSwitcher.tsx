'use client';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { switchBrand } from '@/app/actions/brands';
import { Check, Plus, ChevronDown, X } from 'lucide-react';

function brandColor(name: string) {
  const palette = ['#ff3c6e','#f59e0b','#10b981','#3b82f6','#8b5cf6','#ec4899','#06b6d4','#f97316'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return palette[Math.abs(h) % palette.length];
}

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function getCookieBrand() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/current_brand_slug=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

export function ProfileSwitcher() {
  const router = useRouter();
  const [brands, setBrands] = useState<any[]>([]);
  const [current, setCurrent] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
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

  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const handleSwitch = async (brand: any) => {
    if (brand.slug === current?.slug) { setOpen(false); return; }
    setSwitching(brand.id);
    setCurrent(brand);
    setOpen(false);
    await switchBrand(brand.slug);
    router.refresh();
    setSwitching(null);
  };

  if (!current) return null;

  const color = brandColor(current.name);

  /* ── Topbar profile button ───────────────────────────────── */
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '5px 12px 5px 6px',
          borderRadius: 14,
          background: 'var(--surface-2)',
          border: `1.5px solid ${color}40`,
          transition: 'opacity 0.15s',
        }}
      >
        {/* Avatar */}
        <span style={{
          width: 32, height: 32,
          borderRadius: 10,
          background: color,
          color: '#fff',
          fontSize: 12, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 2px 8px ${color}60`,
        }}>
          {initials(current.name)}
        </span>

        {/* Labels */}
        <div style={{ textAlign: 'left', minWidth: 0 }}>
          <p style={{
            fontSize: 13, fontWeight: 700, lineHeight: 1.2,
            color: 'var(--text)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            maxWidth: 100,
          }}>
            {current.name}
          </p>
          <p style={{ fontSize: 9.5, color: color, lineHeight: 1, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Active Profile
          </p>
        </div>

        <ChevronDown size={13} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
      </button>

      {/* ── Bottom-sheet account switcher ─────────────────────── */}
      {mounted && open && createPortal(
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(6px)',
              WebkitBackdropFilter: 'blur(6px)',
              animation: 'fadeIn 0.2s ease both',
            }}
          />

          {/* Sheet — always anchored to bottom, zero coordinate math */}
          <div
            style={{
              position: 'fixed',
              bottom: 0, left: 0, right: 0,
              zIndex: 9999,
              background: 'var(--surface)',
              borderRadius: '24px 24px 0 0',
              paddingBottom: 'env(safe-area-inset-bottom)',
              animation: 'slideUp 0.3s cubic-bezier(0.32,0.72,0,1) both',
              maxHeight: '85vh',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
              <div style={{ width: 40, height: 4, borderRadius: 2, background: 'var(--border-2)' }} />
            </div>

            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 20px 10px',
            }}>
              <div>
                <p style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.3px' }}>
                  Switch Profile
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                  {brands.length} profile{brands.length !== 1 ? 's' : ''} in your workspace
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--surface-2)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <X size={14} style={{ color: 'var(--text-3)' }} />
              </button>
            </div>

            {/* Profile cards */}
            <div style={{ padding: '4px 16px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {brands.map(b => {
                const active = b.slug === current?.slug;
                const bColor = brandColor(b.name);
                const isLoading = switching === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => handleSwitch(b)}
                    disabled={!!switching}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px',
                      borderRadius: 18,
                      background: active ? `${bColor}14` : 'var(--surface-2)',
                      border: `2px solid ${active ? bColor : 'transparent'}`,
                      textAlign: 'left',
                      width: '100%',
                      transition: 'opacity 0.15s',
                      opacity: switching && !isLoading ? 0.5 : 1,
                      position: 'relative',
                    }}
                  >
                    {/* Profile avatar */}
                    <span style={{
                      width: 52, height: 52,
                      borderRadius: 16,
                      background: bColor,
                      color: '#fff',
                      fontSize: 18, fontWeight: 800,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: active ? `0 6px 20px ${bColor}55` : `0 2px 8px ${bColor}30`,
                    }}>
                      {isLoading ? (
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          border: '2.5px solid rgba(255,255,255,0.3)',
                          borderTopColor: '#fff',
                          animation: 'spin 0.7s linear infinite',
                          display: 'block',
                        }} />
                      ) : initials(b.name)}
                    </span>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        fontSize: 16, fontWeight: 700, lineHeight: 1.25,
                        color: active ? bColor : 'var(--text)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {b.name}
                      </p>
                      <p style={{
                        fontSize: 12, color: 'var(--text-3)', marginTop: 3,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {b.description || 'No description'}
                      </p>
                      {active && (
                        <p style={{
                          fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                          color: bColor, marginTop: 4, textTransform: 'uppercase',
                        }}>
                          ● Current Profile
                        </p>
                      )}
                    </div>

                    {/* Active check */}
                    {active && (
                      <span style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: bColor,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: `0 4px 12px ${bColor}55`,
                      }}>
                        <Check size={13} color="white" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Create new profile */}
            <div style={{ padding: '8px 16px 16px' }}>
              <button
                onClick={() => { setOpen(false); router.push('/brands/new'); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: 'var(--surface-2)',
                  border: '2px dashed var(--border-2)',
                  width: '100%',
                  textAlign: 'left',
                }}
              >
                <span style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'var(--surface-3)', border: '2px dashed var(--border-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Plus size={22} style={{ color: 'var(--text-3)' }} />
                </span>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-2)' }}>Create New Profile</p>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>
                    New brand identity & workspace
                  </p>
                </div>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
