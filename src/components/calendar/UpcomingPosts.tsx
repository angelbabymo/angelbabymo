'use client';
import { ScheduledPost } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import { format, isToday, isTomorrow } from 'date-fns';
import { useUpdatePost, useDeletePost } from '@/hooks/usePosts';
import { CheckCircle, Trash2 } from 'lucide-react';

interface UpcomingPostsProps {
  posts: ScheduledPost[];
}

export function UpcomingPosts({ posts }: UpcomingPostsProps) {
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  const upcoming = posts
    .filter((p) => p.status === 'scheduled' || p.status === 'draft')
    .slice(0, 8);

  if (upcoming.length === 0) {
    return (
      <div className="card p-6">
        <h3 className="font-display tracking-widest text-base mb-4" style={{ color: 'var(--text)' }}>
          UPCOMING
        </h3>
        <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>No upcoming posts scheduled.</p>
      </div>
    );
  }

  const getRelativeDay = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isToday(d))    return 'Today';
    if (isTomorrow(d)) return 'Tomorrow';
    return format(d, 'EEE, MMM d');
  };

  const STATUS_COLORS: Record<string, string> = {
    scheduled: 'var(--cyan)',
    draft:     'var(--gold)',
    posted:    'var(--green)',
    skipped:   'var(--text-3)',
  };

  return (
    <div className="card p-6">
      <h3 className="font-display tracking-widest text-base mb-4" style={{ color: 'var(--text)' }}>
        UPCOMING
      </h3>
      <div className="flex flex-col gap-2">
        {upcoming.map((post) => {
          const catColor = getCategoryColor(post.category);
          return (
            <div
              key={post.id}
              className="group flex items-center gap-3 p-3 rounded-lg"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-1 h-8 rounded-full shrink-0"
                style={{ background: STATUS_COLORS[post.status] ?? 'var(--border)' }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-medium truncate" style={{ color: 'var(--text)' }}>
                  {post.title}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono text-[9px]" style={{ color: 'var(--text-3)' }}>
                    {getRelativeDay(post.scheduled_for)} · {format(new Date(post.scheduled_for), 'h:mm a')}
                  </span>
                  <span className="tag" style={{ color: catColor, background: `${catColor}1a` }}>
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => updatePost.mutate({ id: post.id, status: 'posted' })}
                  className="p-1 rounded"
                  style={{ color: 'var(--green)' }}
                  aria-label="Mark as posted"
                >
                  <CheckCircle size={13} />
                </button>
                <button
                  onClick={() => deletePost.mutate(post.id)}
                  className="p-1 rounded"
                  style={{ color: 'var(--text-3)' }}
                  aria-label="Delete post"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
