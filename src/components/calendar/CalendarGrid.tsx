'use client';
import { ScheduledPost } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import {
  startOfMonth, endOfMonth, eachDayOfInterval,
  startOfWeek, endOfWeek, format, isSameMonth, isToday,
} from 'date-fns';

interface CalendarGridProps {
  posts: ScheduledPost[];
  currentMonth: Date;
  onDayClick?: (date: Date) => void;
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarGrid({ posts, currentMonth, onDayClick }: CalendarGridProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd   = endOfMonth(currentMonth);
  const gridStart  = startOfWeek(monthStart);
  const gridEnd    = endOfWeek(monthEnd);
  const days       = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const postsByDay = posts.reduce<Record<string, ScheduledPost[]>>((acc, post) => {
    const key = format(new Date(post.scheduled_for), 'yyyy-MM-dd');
    if (!acc[key]) acc[key] = [];
    acc[key].push(post);
    return acc;
  }, {});

  const STATUS_BORDER: Record<string, string> = {
    scheduled: 'var(--cyan)',
    posted:    'var(--green)',
    draft:     'var(--gold)',
    skipped:   'var(--text-3)',
  };

  return (
    <div className="card p-5">
      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center font-mono text-[10px] py-2" style={{ color: 'var(--text-3)' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const key      = format(day, 'yyyy-MM-dd');
          const dayPosts = postsByDay[key] ?? [];
          const inMonth  = isSameMonth(day, currentMonth);
          const today    = isToday(day);

          return (
            <div
              key={key}
              onClick={() => inMonth && onDayClick?.(day)}
              className={`min-h-[80px] rounded-lg p-1.5 flex flex-col gap-1 ${inMonth && onDayClick ? 'cursor-pointer' : ''}`}
              style={{
                background: today ? 'var(--surface-3)' : 'var(--surface-2)',
                border: today ? '1px solid var(--border-2)' : '1px solid transparent',
                opacity: inMonth ? 1 : 0.3,
              }}
            >
              <div
                className="font-mono text-[11px] font-bold text-right"
                style={{ color: today ? 'var(--red)' : 'var(--text-3)' }}
              >
                {format(day, 'd')}
              </div>
              {dayPosts.slice(0, 3).map((post) => {
                const catColor = getCategoryColor(post.category);
                return (
                  <div
                    key={post.id}
                    className="rounded px-1.5 py-0.5 text-[9px] font-medium truncate"
                    style={{
                      background: `${catColor}18`,
                      color: catColor,
                      borderLeft: `2px solid ${STATUS_BORDER[post.status] ?? 'var(--border)'}`,
                    }}
                    title={post.title}
                  >
                    {post.title}
                  </div>
                );
              })}
              {dayPosts.length > 3 && (
                <div className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>
                  +{dayPosts.length - 3} more
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
