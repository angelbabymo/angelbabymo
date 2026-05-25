'use client';
import { useState } from 'react';
import { ScoreBadge } from './ScoreBadge';
import { ChevronDown, ChevronUp, ExternalLink, Copy, Check } from 'lucide-react';

function commissionEarned(price?: number, rate?: number): string | null {
  if (!price || !rate) return null;
  const earned = (price * rate) / 100;
  return earned >= 0.01 ? `$${earned.toFixed(2)}` : null;
}

export function ProductCard({ score }: { score: any }) {
  const [open, setOpen]       = useState(false);
  const [copied, setCopied]   = useState<string | null>(null);
  const draft   = score.drafts?.[0];
  const product = score.products;
  const commEarned = commissionEarned(product?.price_usd, product?.commission_rate);

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const stagePill = (stage: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      Hot:       { bg: 'rgba(255,60,110,0.15)', color: 'var(--red)' },
      Rising:    { bg: 'rgba(251,191,36,0.15)', color: '#f59e0b' },
      Saturated: { bg: 'var(--surface-2)',       color: 'var(--text-3)' },
    };
    const s = map[stage] ?? map.Saturated;
    return (
      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full" style={{ background: s.bg, color: s.color }}>
        {stage}
      </span>
    );
  };

  return (
    <article
      className="rounded-2xl overflow-hidden transition-all"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Header */}
      <button onClick={() => setOpen(!open)} className="flex w-full items-start gap-3 p-4 text-left">
        {product?.product_image_url && (
          <img src={product.product_image_url} alt={product.product_name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {stagePill(score.stage)}
            {commEarned && (
              <span className="text-[11px] font-mono font-bold" style={{ color: 'var(--cyan)' }}>{commEarned}/sale</span>
            )}
            {product?.commission_rate && (
              <span className="text-[10px] font-mono" style={{ color: 'var(--text-3)' }}>{product.commission_rate}%</span>
            )}
          </div>
          <h3 className="font-semibold text-[14px] truncate" style={{ color: 'var(--text)' }}>{product?.product_name}</h3>
          <p className="text-[12px] mt-0.5 line-clamp-1" style={{ color: 'var(--text-3)' }}>{score.hook}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ScoreBadge value={score.score} action={score.action} />
          {open ? <ChevronUp size={14} style={{ color: 'var(--text-3)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />}
        </div>
      </button>

      {/* Details */}
      {open && (
        <div className="px-4 pb-4 flex flex-col gap-4" style={{ borderTop: '1px solid var(--border)' }}>
          {/* Product stats */}
          {(product?.price_usd || product?.units_sold_total || product?.product_rating || commEarned) && (
            <div className="flex flex-col gap-2 pt-3">
              {commEarned && (
                <div className="rounded-xl px-4 py-3 flex items-center justify-between"
                  style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)' }}>
                  <div>
                    <p className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--cyan)' }}>You Earn Per Sale</p>
                    <p className="font-bold text-[22px] mt-0.5" style={{ color: 'var(--cyan)' }}>{commEarned}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>Commission Rate</p>
                    <p className="font-semibold text-[16px] mt-0.5" style={{ color: 'var(--text-2)' }}>{product.commission_rate}%</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                {product?.price_usd && <StatChip label="Price" value={`$${product.price_usd}`} />}
                {product?.units_sold_total && <StatChip label="Sold" value={product.units_sold_total.toLocaleString()} />}
                {product?.product_rating && <StatChip label="Rating" value={`${product.product_rating}★`} />}
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="rounded-xl px-3 py-2.5 text-[12px]" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
            <span className="font-mono text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>Why: </span>
            {score.reason}
          </div>

          {/* Rubric */}
          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>Score Breakdown</p>
            {Object.entries(score.rubric_breakdown ?? {}).map(([key, val]) => (
              <RubricBar key={key} label={key.replace(/_/g, ' ')} value={val as number} max={key === 'creator_repetition' ? 3 : key === 'longevity' ? 1 : 2} />
            ))}
          </div>

          {/* Draft */}
          {draft && (
            <div className="flex flex-col gap-3">
              <p className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>AI Draft</p>

              <CopySection label="Script" text={draft.script} onCopy={() => copyText(draft.script, 'script')} copied={copied === 'script'} pre />
              <CopySection label="Caption" text={draft.caption} onCopy={() => copyText(draft.caption, 'caption')} copied={copied === 'caption'} />
              <CopySection label="CTA" text={draft.cta} onCopy={() => copyText(draft.cta, 'cta')} copied={copied === 'cta'} />

              <div>
                <p className="text-[11px] font-semibold mb-1.5" style={{ color: 'var(--text-2)' }}>Hook Variations</p>
                <div className="flex flex-col gap-1.5">
                  {draft.hook_variations?.map((h: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg text-[12px]" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>
                      <span className="font-mono text-[10px] shrink-0 mt-0.5" style={{ color: 'var(--text-3)' }}>{i + 1}</span>
                      {h}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-[11px] rounded-lg px-3 py-2" style={{ background: 'var(--surface-2)', color: 'var(--text-3)' }}>
                <span className="font-semibold" style={{ color: 'var(--text-2)' }}>Spark: </span>{draft.spark_recommendation}
              </div>
            </div>
          )}

          {product?.product_url && (
            <a href={product.product_url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[12px] font-medium" style={{ color: 'var(--cyan)' }}>
              <ExternalLink size={12} /> View on TikTok Shop
            </a>
          )}
        </div>
      )}
    </article>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-center p-2 rounded-lg" style={{ background: 'var(--surface-2)' }}>
      <span className="font-mono text-[9px] uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="font-semibold text-[13px]" style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}

function RubricBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] w-36 capitalize shrink-0" style={{ color: 'var(--text-3)' }}>{label}</span>
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--red)' }} />
      </div>
      <span className="font-mono text-[10px] w-6 text-right" style={{ color: 'var(--text-3)' }}>{value}</span>
    </div>
  );
}

function CopySection({ label, text, onCopy, copied, pre = false }: { label: string; text: string; onCopy: () => void; copied: boolean; pre?: boolean }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <p className="text-[11px] font-semibold" style={{ color: 'var(--text-2)' }}>{label}</p>
        <button onClick={onCopy} className="flex items-center gap-1 text-[10px]" style={{ color: copied ? '#22c55e' : 'var(--text-3)' }}>
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {pre
        ? <pre className="whitespace-pre-wrap text-[12px] rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-2)', color: 'var(--text-2)', fontFamily: 'inherit' }}>{text}</pre>
        : <p className="text-[12px] rounded-lg px-3 py-2.5" style={{ background: 'var(--surface-2)', color: 'var(--text-2)' }}>{text}</p>
      }
    </div>
  );
}
