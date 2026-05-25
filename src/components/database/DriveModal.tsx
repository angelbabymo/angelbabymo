'use client';
import { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Folder, FileImage, FileVideo, Home, ChevronRight, Check, Loader2, CloudOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  thumbnailLink?: string;
  size?: string;
  modifiedTime: string;
}

interface DriveModalProps {
  open: boolean;
  onClose: () => void;
  folderId: string | null;
}

const FOLDER_MIME = 'application/vnd.google-apps.folder';

export function DriveModal({ open, onClose, folderId }: DriveModalProps) {
  const queryClient = useQueryClient();

  const [driveFolderId, setDriveFolderId] = useState('root');
  const [trail, setTrail]                 = useState<{ id: string; name: string }[]>([]);
  const [files, setFiles]                 = useState<DriveFile[]>([]);
  const [loading, setLoading]             = useState(false);
  const [connected, setConnected]         = useState<boolean | null>(null);
  const [selected, setSelected]           = useState<Set<string>>(new Set());
  const [importing, setImporting]         = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [error, setError]                 = useState('');

  const loadFiles = useCallback(async (id: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/drive/files?folderId=${id}`);
      const data = await res.json();
      if (res.status === 401 && data.error === 'not_connected') {
        setConnected(false);
        return;
      }
      if (!res.ok) throw new Error(data.error ?? 'Unknown error');
      setConnected(true);
      setFiles(data.files ?? []);
      setDriveFolderId(id);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setTrail([]);
      setSelected(new Set());
      loadFiles('root');
    }
  }, [open, loadFiles]);

  const openFolder = (id: string, name: string) => {
    setTrail((prev) => [...prev, { id, name }]);
    setSelected(new Set());
    loadFiles(id);
  };

  const goTo = (index: number) => {
    const next = trail.slice(0, index + 1);
    setTrail(next);
    loadFiles(next[next.length - 1].id);
  };

  const goToRoot = () => {
    setTrail([]);
    setSelected(new Set());
    loadFiles('root');
  };

  const toggleSelect = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleImport = async () => {
    const toImport = files.filter((f) => selected.has(f.id));
    setImporting(true);
    setImportProgress(0);
    setError('');

    for (let i = 0; i < toImport.length; i++) {
      const f = toImport[i];
      const res = await fetch('/api/drive/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId: f.id, fileName: f.name, mimeType: f.mimeType, folderId }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(`Failed to import "${f.name}": ${d.error}`);
      }
      setImportProgress(i + 1);
    }

    setImporting(false);
    setSelected(new Set());
    queryClient.invalidateQueries({ queryKey: ['clips'] });
    if (!error) onClose();
  };

  const folders    = files.filter((f) => f.mimeType === FOLDER_MIME);
  const mediaFiles = files.filter((f) => f.mimeType.startsWith('image/') || f.mimeType.startsWith('video/'));
  const inRoot     = trail.length === 0;

  // Not connected — show connect prompt
  if (connected === false) {
    return (
      <Modal open={open} onClose={onClose} title="Google Drive">
        <div className="flex flex-col items-center gap-5 py-10 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
            <CloudOff size={24} style={{ color: 'var(--text-3)' }} />
          </div>
          <div>
            <p className="font-medium text-[14px]" style={{ color: 'var(--text)' }}>Connect Google Drive</p>
            <p className="text-[12px] mt-1" style={{ color: 'var(--text-3)' }}>
              Browse your Drive and import photos & videos directly into Creator OS.
            </p>
          </div>
          <a
            href="/api/auth/google"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-white"
            style={{ background: 'var(--red)' }}
          >
            Connect Google Drive
          </a>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={onClose} title="Import from Google Drive" width="max-w-2xl">
      <div className="flex flex-col gap-4">

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={goToRoot}
            className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg text-[12px] font-medium"
            style={{ color: inRoot ? 'var(--text)' : 'var(--text-3)', background: inRoot ? 'var(--surface-2)' : 'transparent' }}
          >
            <Home size={11} /> My Drive
          </button>
          {trail.map((crumb, i) => (
            <div key={crumb.id} className="flex items-center gap-1 shrink-0">
              <ChevronRight size={10} style={{ color: 'var(--text-3)' }} />
              <button
                onClick={() => goTo(i)}
                className="px-2 py-1 rounded-lg text-[12px] font-medium"
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

        {/* File browser */}
        <div className="min-h-[280px] max-h-[55vh] overflow-y-auto flex flex-col gap-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={22} className="animate-spin" style={{ color: 'var(--text-3)' }} />
            </div>
          ) : (
            <>
              {/* Folders */}
              {folders.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
                    Folders
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {folders.map((f) => (
                      <button
                        key={f.id}
                        onClick={() => openFolder(f.id, f.name)}
                        className="flex items-center gap-2 p-3 rounded-lg text-left transition-all"
                        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                      >
                        <Folder size={15} fill="rgba(255,60,110,0.2)" style={{ color: 'var(--red)', flexShrink: 0 }} />
                        <span className="text-[12px] truncate" style={{ color: 'var(--text)' }}>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Media files */}
              {mediaFiles.length > 0 && (
                <div>
                  <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
                    Photos & Videos — tap to select
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {mediaFiles.map((f) => {
                      const sel     = selected.has(f.id);
                      const isVideo = f.mimeType.startsWith('video/');
                      return (
                        <button
                          key={f.id}
                          onClick={() => toggleSelect(f.id)}
                          className="relative aspect-square rounded-lg overflow-hidden transition-all"
                          style={{
                            background: 'var(--surface-2)',
                            border: `2px solid ${sel ? 'var(--red)' : 'var(--border)'}`,
                          }}
                        >
                          {f.thumbnailLink ? (
                            <img
                              src={f.thumbnailLink.replace('=s220', '=s400')}
                              alt={f.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              {isVideo
                                ? <FileVideo size={20} style={{ color: 'var(--text-3)' }} />
                                : <FileImage size={20} style={{ color: 'var(--text-3)' }} />
                              }
                            </div>
                          )}
                          {sel && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'var(--red)' }}>
                              <Check size={11} color="white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {folders.length === 0 && mediaFiles.length === 0 && (
                <div className="flex items-center justify-center py-16 text-[13px]" style={{ color: 'var(--text-3)' }}>
                  This folder is empty
                </div>
              )}
            </>
          )}
        </div>

        {error && <p className="text-[12px]" style={{ color: 'var(--red)' }}>{error}</p>}

        {/* Import bar */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid var(--border)' }}>
            <span className="text-[12px]" style={{ color: 'var(--text-2)' }}>
              {importing
                ? `Importing ${importProgress} of ${selected.size}...`
                : `${selected.size} file${selected.size > 1 ? 's' : ''} selected`}
            </span>
            <Button onClick={handleImport} loading={importing}>
              Import {selected.size} file{selected.size > 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
