'use client';
import { useState } from 'react';
import { usePosts } from '@/hooks/usePosts';
import { CalendarGrid } from '@/components/calendar/CalendarGrid';
import { UpcomingPosts } from '@/components/calendar/UpcomingPosts';
import { AddPostModal } from '@/components/calendar/AddPostModal';
import { AIScheduler } from '@/components/calendar/AIScheduler';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { ChevronLeft, ChevronRight, Plus, Zap, Hammer } from 'lucide-react';
import { format, addMonths, subMonths } from 'date-fns';
import { getCategoryColor } from '@/lib/utils';
import { CATEGORIES } from '@/lib/constants';

type Mode = 'build' | 'ai';

export default function CalendarPage() {
  const { data: posts = [], isLoading } = usePosts();
  const setAddPostOpen = useUIStore((s) => s.setAddPostOpen);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [mode, setMode]                 = useState<Mode>('build');
  const [prefilledDate, setPrefilledDate] = useState<string>('');

  const handleDayClick = (date: Date) => {
    const iso = date.toISOString().slice(0, 16);
    setPrefilledDate(iso);
    setAddPostOpen(true);
  };

  const totalPosts     = posts.length;
  const scheduledPosts = posts.filter((p) => p.status === 'scheduled').length;
  const postedCount    = posts.filter((p) => p.status === 'posted').length;

  const catCounts = CATEGORIES.map((cat) => ({
    cat,
    count: posts.filter((p) => p.category === cat).length,
  })).filter((d) => d.count > 0);

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[13px]" style={{ color: 'var(--text-2)' }}>
          {scheduledPosts} scheduled · {postedCount} posted
        </p>
        <Button onClick={() => setAddPostOpen(true)} size="sm">
          <Plus size={13} /> Add Post
        </Button>
      </div>

      {/* Mode toggle */}
      <div
        className="flex rounded-xl p-1 gap-1"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {([
          { key: 'build', label: 'Build Myself', icon: Hammer },
          { key: 'ai',    label: 'Ask AI',       icon: Zap },
        ] as { key: Mode; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: mode === key ? 'var(--surface-3)' : 'transparent',
              color:      mode === key ? 'var(--text)' : 'var(--text-3)',
              border:     mode === key ? '1px solid var(--border-2)' : '1px solid transparent',
            }}
          >
            <Icon size={13} />
            {label}
          </button>
        ))}
      </div>

      {/* AI Scheduler */}
      {mode === 'ai' && <AIScheduler currentMonth={currentMonth} />}

      {/* Category balance */}
      {catCounts.length > 0 && (
        <div className="card p-4">
          <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--text-3)' }}>
            Category Balance
          </div>
          <div className="flex items-end gap-2 h-10">
            {catCounts.map(({ cat, count }) => {
              const pct   = totalPosts > 0 ? (count / totalPosts) * 100 : 0;
              const color = getCategoryColor(cat);
              return (
                <div key={cat} className="flex flex-col items-center gap-1" style={{ flex: 1 }}>
                  <div className="w-full rounded-t" style={{ height: `${Math.max(pct * 0.7, 4)}px`, background: color }} />
                  <span className="font-mono text-[8px] hidden sm:block" style={{ color: 'var(--text-3)' }}>{cat}</span>
                  <span className="font-mono text-[9px] font-bold" style={{ color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
            className="p-2 rounded-lg transition-all active:opacity-60"
            style={{ border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <ChevronLeft size={14} />
          </button>
          <h3 className="font-display tracking-widest text-base" style={{ color: 'var(--text)' }}>
            {format(currentMonth, 'MMMM yyyy').toUpperCase()}
          </h3>
          <button
            onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
            className="p-2 rounded-lg transition-all active:opacity-60"
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

      {/* Build mode hint */}
      {mode === 'build' && (
        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          Tap any day on the calendar to schedule a post, or use the Add Post button.
        </p>
      )}

      {/* Calendar + Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="card h-80 animate-pulse" />
          ) : (
            <CalendarGrid
              posts={posts}
              currentMonth={currentMonth}
              onDayClick={mode === 'build' ? handleDayClick : undefined}
            />
          )}
        </div>
        <UpcomingPosts posts={posts} />
      </div>

      <AddPostModal prefilledDate={prefilledDate} />
    </div>
  );
}
