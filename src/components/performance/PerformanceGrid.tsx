'use client';
import { Clip } from '@/types';
import { getPerformance, getPerformanceBadge, getCategoryColor, formatNumber } from '@/lib/utils';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

interface PerformanceGridProps {
  clips: Clip[];
}

export function PerformanceGrid({ clips }: PerformanceGridProps) {
  const sorted = [...clips].sort((a, b) => b.saves + b.shares - (a.saves + a.shares));

  return (
    <div>
      <h3 className="font-display tracking-widest text-base mb-4" style={{ color: 'var(--text)' }}>
        ALL CLIPS — RANKED
      </h3>
      <div className="flex flex-col gap-2">
        {sorted.map((clip, i) => {
          const perf    = getPerformance(clip);
          const badge   = getPerformanceBadge(perf);
          const catColor = getCategoryColor(clip.category);

          return (
            <motion.div
              key={clip.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-4 px-5 py-3.5 rounded-xl"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <span className="font-mono text-[11px] font-bold w-5 shrink-0" style={{ color: 'var(--text-3)' }}>
                {i + 1}
              </span>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>
                  {clip.clip_name}
                </div>
                {clip.post_date && (
                  <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                    {format(new Date(clip.post_date), 'MMM d')}
                  </div>
                )}
              </div>

              <span className="tag shrink-0" style={{ color: catColor, background: `${catColor}1a` }}>
                {clip.category}
              </span>

              <div className="hidden md:grid grid-cols-4 gap-6 shrink-0">
                <MiniStat label="Views"  value={formatNumber(clip.views)} />
                <MiniStat label="Saves"  value={formatNumber(clip.saves)}  color="var(--red)" />
                <MiniStat label="Shares" value={formatNumber(clip.shares)} color="var(--cyan)" />
                <MiniStat label="Watch"  value={`${clip.watch_time_pct}%`} />
              </div>

              <span className="tag shrink-0" style={{ color: badge.color, background: badge.bg }}>
                {badge.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function MiniStat({ label, value, color = 'var(--text)' }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[12px] font-bold" style={{ color }}>{value}</div>
      <div className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>{label}</div>
    </div>
  );
}
