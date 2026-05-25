'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useBrand } from '@/hooks/useBrand';
import { ProductCard } from '@/components/intel/ProductCard';
import { ScanNowButton } from '@/components/intel/ScanNowButton';
import { PushPermissionPrompt } from '@/components/intel/PushPermissionPrompt';
import { ScanParameters } from '@/components/intel/ScanParameters';
import { Zap } from 'lucide-react';
import Link from 'next/link';

const STAGES = ['Hot', 'Rising', 'Saturated'] as const;

function getToday() {
  const d = new Date(); d.setHours(0,0,0,0); return d.toISOString();
}

export default function IntelPage() {
  const [tab, setTab]       = useState<'today' | 'kanban'>('today');
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: brand, isLoading: brandLoading } = useBrand();
  const supabase = createClient();

  useEffect(() => {
    if (brandLoading) return;
    if (!brand?.id) { setLoading(false); return; }
    setLoading(true);
    supabase
      .from('product_scores')
      .select('*, products(*), drafts:drafts!drafts_product_id_fkey(*)')
      .eq('brand_id', brand.id)
      .gte('scored_at', getToday())
      .order('score', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        setScores(data ?? []);
        setLoading(false);
      });
  }, [brand?.id, brandLoading]);

  if (!brandLoading && !brand) {
    return (
      <div className="flex flex-col items-center justify-center gap-5 py-24 text-center">
        <div className="text-5xl">🎯</div>
        <div>
          <p className="font-semibold text-[16px]" style={{ color: 'var(--text)' }}>No brand selected</p>
          <p className="text-[13px] mt-1" style={{ color: 'var(--text-3)' }}>Create your first brand to start scanning TikTok products</p>
        </div>
        <Link href="/brands/new" className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: 'var(--red)' }}>
          Create Brand
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">

      {/* Header — title left, Scan Now right, always fits on mobile */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-widest leading-tight" style={{ color: 'var(--text)' }}>
            PRODUCT<span style={{ color: 'var(--red)' }}>INTEL</span>
          </h1>
          <p className="text-[12px] mt-0.5" style={{ color: 'var(--text-3)' }}>Today's TikTok Shop opportunities</p>
        </div>
        <div className="shrink-0 pt-0.5">
          <ScanNowButton />
        </div>
      </div>

      <PushPermissionPrompt />

      {/* Scan parameters — always visible so user knows what's being scanned */}
      {brand && <ScanParameters brandId={brand.id} />}

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl p-1" style={{ background: 'var(--surface-2)' }}>
        {(['today', 'kanban'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all capitalize"
            style={{
              background: tab === t ? 'var(--surface)' : 'transparent',
              color: tab === t ? 'var(--text)' : 'var(--text-3)',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            }}
          >
            {t === 'today' ? '⚡ Today' : '🗂 Kanban'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map(i => <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'var(--surface)' }} />)}
        </div>
      ) : tab === 'today' ? (
        <TodayFeed scores={scores} />
      ) : (
        <KanbanView scores={scores} />
      )}
    </div>
  );
}

function TodayFeed({ scores }: { scores: any[] }) {
  if (!scores.length) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Zap size={32} style={{ color: 'var(--text-3)' }} />
        <div>
          <p className="font-medium text-[14px]" style={{ color: 'var(--text)' }}>No scans yet today</p>
          <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>Hit Scan Now to pull today's TikTok Shop data</p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-3">
      {scores.map(s => <ProductCard key={s.id} score={s} />)}
    </div>
  );
}

function KanbanView({ scores }: { scores: any[] }) {
  // Kanban shows last 7 days — load separately if empty
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {STAGES.map(stage => {
        const items = scores.filter(s => s.stage === stage);
        return (
          <div key={stage} className="rounded-2xl p-3 flex flex-col gap-2" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 px-1">
              <span className="text-[13px] font-semibold" style={{ color: 'var(--text)' }}>{stage}</span>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                {items.length}
              </span>
            </div>
            {items.length === 0 ? (
              <p className="text-[11px] px-1" style={{ color: 'var(--text-3)' }}>None today</p>
            ) : (
              items.map(s => (
                <div key={s.id} className="flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                  <span className="text-[12px] truncate" style={{ color: 'var(--text)' }}>{s.products?.product_name}</span>
                  <span className="font-mono text-[11px] shrink-0 font-bold" style={{ color: s.score >= 7.5 ? 'var(--red)' : 'var(--text-3)' }}>
                    {s.score.toFixed(1)}
                  </span>
                </div>
              ))
            )}
          </div>
        );
      })}
    </div>
  );
}
