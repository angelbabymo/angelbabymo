'use client';
import { Clip } from '@/types';
import { formatNumber } from '@/lib/utils';
import { Heart, Share2, Clock, User, MousePointerClick, MessageCircle, Eye, TrendingUp } from 'lucide-react';

interface MetricTiersProps {
  clip: Clip;
}

export function MetricTiers({ clip }: MetricTiersProps) {
  return (
    <div className="grid grid-cols-3 gap-3 mt-3">
      {/* Tier 1 — Impact */}
      <div
        className="rounded-lg p-3"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
      >
        <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--red)' }}>
          T1 · Impact
        </div>
        <div className="flex flex-col gap-1.5">
          <MetricLine icon={Heart}            label="Saves"       value={clip.saves} />
          <MetricLine icon={Share2}           label="Shares"      value={clip.shares} />
          <MetricLine icon={Clock}            label="Watch %"     value={clip.watch_time_pct} suffix="%" />
          <MetricLine icon={User}             label="Profile"     value={clip.profile_visits} />
        </div>
      </div>

      {/* Tier 2 — Monetization */}
      <div
        className="rounded-lg p-3"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
      >
        <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--gold)' }}>
          T2 · Monetize
        </div>
        <div className="flex flex-col gap-1.5">
          <MetricLine icon={MousePointerClick} label="Clicks"   value={clip.affiliate_clicks} />
          <MetricLine icon={MessageCircle}     label="Comments" value={clip.comments} />
          <MetricLine icon={Share2}            label="Reposts"  value={clip.reposts} />
        </div>
      </div>

      {/* Tier 3 — Reach */}
      <div
        className="rounded-lg p-3"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
      >
        <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--cyan)' }}>
          T3 · Reach
        </div>
        <div className="flex flex-col gap-1.5">
          <MetricLine icon={Eye}       label="Views"     value={clip.views} />
          <MetricLine icon={TrendingUp} label="Followers" value={clip.followers_gained} />
        </div>
      </div>
    </div>
  );
}

function MetricLine({
  icon: Icon,
  label,
  value,
  suffix = '',
}: {
  icon: React.ComponentType<{ size: number }>;
  label: string;
  value: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon size={10} />
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</span>
      </div>
      <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text)' }}>
        {suffix ? `${value}${suffix}` : formatNumber(value)}
      </span>
    </div>
  );
}
