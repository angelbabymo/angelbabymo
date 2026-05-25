'use client';
import { useState, useRef, useEffect } from 'react';
import { useClips, useAddClip } from '@/hooks/useClips';
import { useFolders } from '@/hooks/useFolders';
import { FolderCard } from '@/components/database/FolderCard';
import { FileCard } from '@/components/database/FileCard';
import { CreateFolderModal } from '@/components/database/CreateFolderModal';
import { AddClipModal } from '@/components/database/AddClipModal';
import { DriveModal } from '@/components/database/DriveModal';
import { Button } from '@/components/ui/Button';
import { useUIStore } from '@/stores/ui.store';
import { uploadClipMedia } from '@/lib/supabase/storage';
import { FolderPlus, Upload, Home, ChevronRight, Plus, HardDrive, ChevronDown, ImageIcon } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface Crumb { id: string; name: string; }

export default function DatabasePage() {
  const setAddClipOpen = useUIStore((s) => s.setAddClipOpen);
  const addClip        = useAddClip();

  const [trail, setTrail]               = useState<Crumb[]>([]);
  const currentFolderId                 = trail.length > 0 ? trail[trail.length - 1].id : null;
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [driveOpen, setDriveOpen]               = useState(false);
  const [uploadMenuOpen, setUploadMenuOpen]     = useState(false);
  const [uploading, setUploading]       = useState(false);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const uploadMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(e.target as Node)) {
        setUploadMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const { data: folders = [], isLoading: foldersLoading } = useFolders(currentFolderId);
  const { data: clips   = [], isLoading: clipsLoading   } = useClips(currentFolderId);
  const { data: allClips = [] }                            = useClips();
  const { data: allFolderClips = [] }                      = useClips(undefined);

  const folderClipCounts = (folderId: string) =>
    allFolderClips.filter((c) => c.folder_id === folderId).length;

  const isLoading = foldersLoading || clipsLoading;
  const inRoot    = trail.length === 0;

  const openFolder = (id: string, name: string) =>
    setTrail((prev) => [...prev, { id, name }]);

  const goTo = (index: number) =>
    setTrail((prev) => prev.slice(0, index + 1));

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      for (const file of files) {
        const thumbnail_url = await uploadClipMedia(file);
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
        await addClip.mutateAsync({
          clip_name: nameWithoutExt,
          category: 'Other',
          folder_id: currentFolderId,
          thumbnail_url,
          views: 0, saves: 0, shares: 0, watch_time_pct: 0,
          profile_visits: 0, affiliate_clicks: 0, comments: 0,
          reposts: 0, followers_gained: 0,
        } as any);
      }
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-5 animate-[fadeUp_0.3s_ease_both]">

      {inRoot && allClips.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Total Clips" value={String(allClips.length)} color="var(--text)" />
          <StatCard label="Total Views" value={formatNumber(allClips.reduce((a, c) => a + c.views, 0))} color="var(--red)" />
          <StatCard label="Avg Watch"   value={`${allClips.length ? Math.round(allClips.reduce((a, c) => a + c.watch_time_pct, 0) / allClips.length) : 0}%`} color="var(--cyan)" />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 flex-1 min-w-0 overflow-x-auto">
          <button
            onClick={() => setTrail([])}
            className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg text-[12px] font-medium transition-all"
            style={{ color: inRoot ? 'var(--text)' : 'var(--text-3)', background: inRoot ? 'var(--surface-2)' : 'transparent' }}
          >
            <Home size={12} /> All Files
          </button>
          {trail.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center gap-1 shrink-0">
              <ChevronRight size={10} style={{ color: 'var(--text-3)' }} />
              <button
                onClick={() => goTo(i)}
                className="px-2 py-1 rounded-lg text-[12px] font-medium transition-all"
                style={{
                  color: i === trail.length - 1 ? 'var(--text)' : 'var(--text-3)',
                  background: i === trail.length - 1 ? 'var(--surface-2)' : 'transparent',
                }}
              >
                {crumb.name}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setCreateFolderOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}
          >
            <FolderPlus size={13} />
            <span className="hidden sm:inline">New Folder</span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleQuickUpload} />
          <div ref={uploadMenuRef} className="relative">
            <Button size="sm" loading={uploading} onClick={() => !uploading && setUploadMenuOpen((v) => !v)}>
              {uploading ? null : <Upload size={13} />}
              {uploading ? 'Uploading...' : 'Upload'}
              {!uploading && <ChevronDown size={11} />}
            </Button>
            {uploadMenuOpen && (
              <div
                className="absolute right-0 top-full mt-1.5 z-50 rounded-xl overflow-hidden flex flex-col"
                style={{ background: 'var(--surface)', border: '1px solid var(--border)', minWidth: '170px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
              >
                <button
                  onClick={() => { setUploadMenuOpen(false); fileInputRef.current?.click(); }}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-left transition-all hover:bg-[var(--surface-2)]"
                  style={{ color: 'var(--text)' }}
                >
                  <ImageIcon size={14} style={{ color: 'var(--text-3)' }} />
                  From Photos
                </button>
                <button
                  onClick={() => { setUploadMenuOpen(false); setDriveOpen(true); }}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] font-medium text-left transition-all hover:bg-[var(--surface-2)]"
                  style={{ color: 'var(--text)', borderTop: '1px solid var(--border)' }}
                >
                  <HardDrive size={14} style={{ color: 'var(--text-3)' }} />
                  From Google Drive
                </button>
              </div>
            )}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setAddClipOpen(true)}>
            <Plus size={13} /> Add Clip
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1,2,3,4,5,6].map((i) => <div key={i} className="rounded-xl h-24 animate-pulse" style={{ background: 'var(--surface)' }} />)}
        </div>
      ) : folders.length === 0 && clips.length === 0 ? (
        <EmptyState onUpload={() => fileInputRef.current?.click()} onNewFolder={() => setCreateFolderOpen(true)} />
      ) : (
        <div className="flex flex-col gap-6">
          {folders.length > 0 && (
            <div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                Folders · {folders.length}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {folders.map((folder) => (
                  <FolderCard
                    key={folder.id}
                    id={folder.id}
                    name={folder.name}
                    parentId={currentFolderId}
                    clipCount={folderClipCounts(folder.id)}
                    onClick={() => openFolder(folder.id, folder.name)}
                  />
                ))}
              </div>
            </div>
          )}

          {clips.length > 0 && (
            <div>
              <div className="font-mono text-[9px] tracking-[2px] uppercase mb-3" style={{ color: 'var(--text-3)' }}>
                Files · {clips.length}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {clips.map((clip) => (
                  <FileCard key={clip.id} clip={clip} folderId={currentFolderId} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <CreateFolderModal open={createFolderOpen} onClose={() => setCreateFolderOpen(false)} parentId={currentFolderId} />
      <AddClipModal folderId={currentFolderId} />
      <DriveModal open={driveOpen} onClose={() => setDriveOpen(false)} folderId={currentFolderId} />
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card p-4">
      <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>{label}</div>
      <div className="font-mono text-xl font-bold" style={{ color }}>{value}</div>
    </div>
  );
}

function EmptyState({ onUpload, onNewFolder }: { onUpload: () => void; onNewFolder: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <Upload size={24} style={{ color: 'var(--text-3)' }} />
      </div>
      <div>
        <p className="font-medium text-[14px]" style={{ color: 'var(--text)' }}>Nothing here yet</p>
        <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>Upload photos or videos, or create a folder to organize your content</p>
      </div>
      <div className="flex gap-3">
        <button onClick={onNewFolder} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium" style={{ background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text-2)' }}>
          <FolderPlus size={14} /> New Folder
        </button>
        <button onClick={onUpload} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: 'var(--red)' }}>
          <Upload size={14} /> Upload Photos
        </button>
      </div>
    </div>
  );
}
