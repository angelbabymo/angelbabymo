'use client';
import { useClips } from '@/hooks/useClips';
import { AttributeCard } from '@/components/performance/AttributeCard';
import { PatternInsight } from '@/components/performance/PatternInsight';
import { PerformanceGrid } from '@/components/performance/PerformanceGrid';
import { EmptyState } from '@/components/ui/EmptyState';
import { getPerformance, formatNumber } from '@/lib/utils';
import { BarChart2, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';

export default function PerformancePage() {
  const { data: clips = [], isLoading } = useClips();

  if (isLoading) return <div className="card h-40 animate-pulse" />;

  if (clips.length === 0) {
    return (
      <EmptyState
        icon={BarChart2}
        title="No data yet"
        description="Add clips with metrics to unlock performance insights."
        action={
          <Link href="/database">
            <Button><Plus size={14} /> Add Your First Clip</Button>
          </Link>
        }
      />
    );
  }

  const totalViews    = clips.reduce((a, c) => a + c.views, 0);
  const totalSaves    = clips.reduce((a, c) => a + c.saves, 0);
  const totalShares   = clips.reduce((a, c) => a + c.shares, 0);
  const totalClicks   = clips.reduce((a, c) => a + c.affiliate_clicks, 0);
  const avgWatch      = Math.round(clips.reduce((a, c) => a + c.watch_time_pct, 0) / clips.length);
  const viralCount    = clips.filter((c) => getPerformance(c) === 'viral').length;
  const viralRate     = `${Math.round((viralCount / clips.length) * 100)}%`;

  // Category bar chart data
  const catData = ['Lifestyle', 'Fashion', 'Affiliate', 'Wellness', 'GRWM', 'Tutorial', 'Other'].map((cat) => ({
    name: cat,
    saves: clips.filter((c) => c.category === cat).reduce((a, c) => a + c.saves, 0),
  })).filter((d) => d.saves > 0);

  const CAT_COLORS: Record<string, string> = {
    Lifestyle: '#8b5cf6', Fashion: '#ff3c6e', Affiliate: '#eab308',
    Wellness: '#06b6d4', GRWM: '#ff3c6e', Tutorial: '#22c55e', Other: '#52525b',
  };

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <AttributeCard label="Total Views"  value={formatNumber(totalViews)} />
        <AttributeCard label="Total Saves"  value={formatNumber(totalSaves)}  color="var(--red)" />
        <AttributeCard label="Total Shares" value={formatNumber(totalShares)} color="var(--cyan)" />
        <AttributeCard label="Aff. Clicks"  value={formatNumber(totalClicks)} color="var(--gold)" />
        <AttributeCard label="Avg Watch %" value={`${avgWatch}%`}            color="var(--violet)" />
        <AttributeCard label="Viral Rate"  value={viralRate}                  color="var(--green)" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Saves by Category chart */}
        <div className="card p-6 lg:col-span-2">
          <h3 className="font-display tracking-widest text-base mb-4" style={{ color: 'var(--text)' }}>
            SAVES BY CATEGORY
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={catData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'var(--font-geist-mono)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-3)', fontFamily: 'var(--font-geist-mono)' }} axisLine={false} tickLine={false} tickFormatter={(v) => formatNumber(v)} />
              <Tooltip
                contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: 'var(--text)', fontFamily: 'var(--font-geist-mono)' }}
                itemStyle={{ color: 'var(--text-2)' }}
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
              />
              <Bar dataKey="saves" radius={[4, 4, 0, 0]}>
                {catData.map((d) => (
                  <Cell key={d.name} fill={CAT_COLORS[d.name] ?? '#52525b'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <PatternInsight clips={clips} />
      </div>

      <PerformanceGrid clips={clips} />
    </div>
  );
}
