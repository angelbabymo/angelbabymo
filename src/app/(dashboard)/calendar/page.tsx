'use client';
import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { UpcomingPosts } from '@/components/calendar/UpcomingPosts';
import { AddPostModal } from '@/components/calendar/AddPostModal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { getCategoryColor } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

export default function CalendarPage() {
  const { data: posts = [], isLoading } = usePosts();
  const setAddPostOpen = useUIStore((s) => s.setAddPostOpen);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Category balance
  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: posts.filter((p) => p.category === cat).length,
  })).filter((d) => d.count > 0);

  const totalPosts     = posts.length;
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length;
  const postedCount    = posts.filter((p) => p.status === 'posted').length;

  return (
    <div className="flex flex-col gap-6 animate-[fadeUp_0.3s_ease_both]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
            {scheduledPosts} scheduled · {postedCount} posted
          </p>
        </div>
        <Button onClick={() => setAddPostOpen(true)}>
          <Plus size={14} /> Schedule Post
        </Button>
      </div>

      {/* Category balance */}
      {catCounts.length > 0 && (
        <div className="card p-4">
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--text-3)' }}>
            Category Balance
          </div>
          <div className="flex items-end gap-3 h-12">
            {catCounts.map(({ cat, count }) => {
              const pct   = totalPosts > 0 ? (count / totalPosts) * 100 : 0;
              const color = getCategoryColor(cat);
              return (
                <div key={cat} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                  <div
                    className="w-full rounded-t transition-all"
                    style={{ height: `${Math.max(pct * 0.8, 4)}px`, background: color }}
                  />
                  <span className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>{cat}</span>
                  <span className="font-mono text-[9px] font-bold" style={{ color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month nav */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-lg transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <h3 className="font-display tracking-widest text-lg" style={{ color: 'var(--text)' }}>
            {format(currentMonth, 'MMMM yyyy').toUpperCase()}
          </h3>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-lg transition-all"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
        <button
          onClick={() => setCurrentMonth(new Date())}
          className="font-mono text-[11px] px-3 py-1.5 rounded-lg"
          style={{ border: '1px solid var(--border)', color: 'var(--text-3)' }}
        >
          Today
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="card h-80 animate-pulse" />
          ) : (
            <CalendarGrid posts={posts} currentMonth={currentMonth} />
          )}
        </div>
        <UpcomingPosts posts={posts} />
      </div>

      <AddPostModal />
    </div>
  );
}
