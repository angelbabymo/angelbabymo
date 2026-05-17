'use client';
import { Clip } from '@/types';
import { getCategoryColor, getPerformance } from '@/lib/utils';

interface PatternInsightProps {
  clips: Clip[];
}

export function PatternInsight({ clips }: PatternInsightProps) {
  if (clips.length === 0) return null;

  // Best performing category
  const catStats = clips.reduce<Record<string, { total: number; count: number }>>((acc, clip) => {
    const perf = getPerformance(clip);
    const score = { viral: 4, good: 3, average: 2, low: 1 }[perf];
    if (!acc[clip.category]) acc[clip.category] = { total: 0, count: 0 };
    acc[clip.category].total += score;
    acc[clip.category].count += 1;
    return acc;
  }, {});

  const bestCat = Object.entries(catStats).sort(
    ([, a], [, b]) => b.total / b.count - a.total / a.count,
  )[0];

  // Best hook style
  const hookStyles = clips.filter((c) => c.hook_style).reduce<Record<string, number>>((acc, c) => {
    if (c.hook_style) acc[c.hook_style] = (acc[c.hook_style] ?? 0) + 1;
    return acc;
  }, {});
  const topHookStyle = Object.entries(hookStyles).sort(([, a], [, b]) => b - a)[0];

  // Viral clips
  const viralClips = clips.filter((c) => getPerformance(c) === 'viral');

  const insights: { label: string; value: string; color: string }[] = [];

  if (bestCat) {
    insights.push({
      label:  'Top Performing Category',
      value:  bestCat[0],
      color:  getCategoryColor(bestCat[0]),
    });
  }

  if (topHookStyle) {
    insights.push({ label: 'Most Used Hook Style', value: topHookStyle[0], color: 'var(--violet)' });
  }

  insights.push({
    label: 'Viral Rate',
    value: `${Math.round((viralClips.length / clips.length) * 100)}%`,
    color: 'var(--red)',
  });

  return (
    <div className="card p-6">
      <h3 className="font-display tracking-widest text-base mb-4" style={{ color: 'var(--text)' }}>
        PATTERN INSIGHTS
      </h3>
      <div className="flex flex-col gap-3">
        {insights.map((ins) => (
          <div
            key={ins.label}
            className="flex items-center justify-between p-3 rounded-lg"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            <span className="text-[12px]" style={{ color: 'var(--text-2)' }}>{ins.label}</span>
            <span className="font-mono text-[12px] font-bold" style={{ color: ins.color }}>
              {ins.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
