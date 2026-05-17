'use client';
import { useState } from 'react';
import { Clip } from '@/types';
import { formatNumber, getCategoryColor, getPerformance, getPerformanceBadge } from '@/lib/utils';
import { MetricTiers } from './MetricTiers';
import { ChevronDown, ChevronUp, Trash2, Eye } from 'lucide-react';
import { useDeleteClip } from '@/hooks/useClips';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ClipRowProps {
  clip: Clip;
  index: number;
}

export function ClipRow({ clip, index }: ClipRowProps) {
  const [expanded, setExpanded] = useState(false);
  const deleteClip = useDeleteClip();
  const perf     = getPerformance(clip);
  const perfBadge = getPerformanceBadge(perf);
  const catColor = getCategoryColor(clip.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
    >
      {/* Row header */}
      <div
        className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-[#18181b] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        {/* Performance dot */}
        <div className="shrink-0 w-2 h-2 rounded-full" style={{ background: perfBadge.color }} />

        {/* Name */}
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>
            {clip.clip_name}
          </div>
          {clip.post_date && (
            <div className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
              {format(new Date(clip.post_date), 'MMM d, yyyy')}
            </div>
          )}
        </div>

        {/* Category */}
        <span
          className="tag shrink-0"
          style={{ color: catColor, background: `${catColor}1a` }}
        >
          {clip.category}
        </span>

        {/* Key metrics */}
        <div className="hidden md:flex items-center gap-6 shrink-0">
          <Metric label="Views"  value={formatNumber(clip.views)} />
          <Metric label="Saves"  value={formatNumber(clip.saves)} color="var(--red)" />
          <Metric label="Shares" value={formatNumber(clip.shares)} color="var(--cyan)" />
          <Metric label="Watch"  value={`${clip.watch_time_pct}%`} />
        </div>

        {/* Performance badge */}
        <span
          className="tag shrink-0"
          style={{ color: perfBadge.color, background: perfBadge.bg }}
        >
          {perfBadge.label}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => deleteClip.mutate(clip.id)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-3)' }}
            aria-label="Delete clip"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {expanded ? (
          <ChevronUp size={14} style={{ color: 'var(--text-3)' }} />
        ) : (
          <ChevronDown size={14} style={{ color: 'var(--text-3)' }} />
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div style={{ borderTop: '1px solid var(--border)' }} className="px-5 pb-5">
              <MetricTiers clip={clip} />

              {clip.hook && (
                <div className="mt-4">
                  <div className="font-mono text-[9px] tracking-[2px] uppercase mb-1.5" style={{ color: 'var(--text-3)' }}>
                    Hook
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--text-2)' }}>{clip.hook}</p>
                </div>
              )}

              {clip.caption && (
                <div className="mt-3">
                  <div className="font-mono text-[9px] tracking-[2px] uppercase mb-1.5" style={{ color: 'var(--text-3)' }}>
                    Caption
                  </div>
                  <p className="text-[12px]" style={{ color: 'var(--text-2)' }}>{clip.caption}</p>
                </div>
              )}

              {/* Tags */}
              {clip.emotional_tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {clip.emotional_tags.map((tag) => (
                    <span key={tag} className="tag" style={{ color: 'var(--violet)', background: 'var(--violet-dim)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function Metric({ label, value, color = 'var(--text)' }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-[12px] font-bold" style={{ color }}>{value}</div>
      <div className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>{label}</div>
    </div>
  );
}
