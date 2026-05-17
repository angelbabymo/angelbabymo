import { Clip, Performance } from '@/types';

export function getPerformance(clip: Clip): Performance {
  const saveScore  = Math.min(clip.saves / 3000, 1) * 40;
  const shareScore = Math.min(clip.shares / 1500, 1) * 30;
  const watchScore = Math.min(clip.watch_time_pct / 80, 1) * 30;
  const total = saveScore + shareScore + watchScore;

  if (total >= 70) return 'viral';
  if (total >= 45) return 'good';
  if (total >= 20) return 'average';
  return 'low';
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function getCategoryColor(cat: string): string {
  const map: Record<string, string> = {
    Lifestyle: 'var(--violet)',
    Fashion:   'var(--red)',
    Affiliate: 'var(--gold)',
    Wellness:  'var(--cyan)',
    GRWM:      'var(--red)',
    Tutorial:  'var(--green)',
    Other:     'var(--text-2)',
  };
  return map[cat] ?? 'var(--text-2)';
}

export function getPerformanceBadge(p: Performance): { label: string; color: string; bg: string } {
  const map = {
    viral:   { label: 'VIRAL',   color: 'var(--red)',    bg: 'var(--red-dim)' },
    good:    { label: 'GOOD',    color: 'var(--green)',  bg: 'var(--green-dim)' },
    average: { label: 'AVG',     color: 'var(--gold)',   bg: 'var(--gold-dim)' },
    low:     { label: 'LOW',     color: 'var(--text-3)', bg: 'var(--surface-3)' },
  };
  return map[p];
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
