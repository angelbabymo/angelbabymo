'use client';
import { useState } from 'react';
import { Play, MoreVertical, Trash2, FolderInput } from 'lucide-react';
import { Clip } from '@/types';
import { getCategoryColor } from '@/lib/utils';
import { useDeleteClip } from '@/hooks/useClips';

interface FileCardProps {
  clip: Clip;
  folderId: string | null;
}

function isVideo(url: string) {
  return /\.(mp4|mov|webm|avi|mkv)(\?|$)/i.test(url);
}

export function FileCard({ clip, folderId }: FileCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const deleteClip = useDeleteClip();
  const catColor   = getCategoryColor(clip.category);
  const hasMedia   = !!clip.thumbnail_url;
  const videoFile  = hasMedia && isVideo(clip.thumbnail_url!);

  const handleDelete = async () => {
    if (confirm(`Delete "${clip.clip_name}"?`)) {
      await deleteClip.mutateAsync(clip.id);
    }
    setMenuOpen(false);
  };

  return (
    <div
      className="relative group rounded-xl overflow-hidden transition-all active:scale-[0.97]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      {/* Thumbnail */}
      <div className="relative w-full aspect-square overflow-hidden" style={{ background: 'var(--surface-2)' }}>
        {hasMedia ? (
          <>
            {videoFile ? (
              <video
                src={clip.thumbnail_url!}
                className="w-full h-full object-cover"
                muted
                preload="metadata"
              />
            ) : (
              <img
                src={clip.thumbnail_url!}
                alt={clip.clip_name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            )}
            {videoFile && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <Play size={14} fill="white" style={{ color: 'white' }} />
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'var(--text-3)' }}>
              {clip.category}
            </span>
          </div>
        )}

        {/* Category dot */}
        <div
          className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full"
          style={{ background: catColor }}
        />

        {/* Menu button */}
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: 'rgba(0,0,0,0.6)', color: 'white' }}
        >
          <MoreVertical size={11} />
        </button>
      </div>

      {/* Name */}
      <div className="px-2.5 py-2">
        <p className="text-[11px] font-medium truncate" style={{ color: 'var(--text)' }}>{clip.clip_name}</p>
        <p className="font-mono text-[9px] mt-0.5" style={{ color: catColor }}>{clip.category}</p>
      </div>

      {/* Context menu */}
      {menuOpen && (
        <div
          className="absolute right-2 top-8 z-20 rounded-lg overflow-hidden shadow-lg"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', minWidth: 130 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-left hover:bg-white/5"
            style={{ color: 'var(--red)' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}

      {/* Click-away for menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
      )}
    </div>
  );
}
