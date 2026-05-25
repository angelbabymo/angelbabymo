'use client';
import { useState } from 'react';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useDeleteFolder, useRenameFolder } from '@/hooks/useFolders';

interface FolderCardProps {
  id: string;
  name: string;
  parentId: string | null;
  clipCount: number;
  onClick: () => void;
}

export function FolderCard({ id, name, parentId, clipCount, onClick }: FolderCardProps) {
  const [menuOpen, setMenuOpen]   = useState(false);
  const [renaming, setRenaming]   = useState(false);
  const [newName, setNewName]     = useState(name);
  const deleteFolder = useDeleteFolder();
  const renameFolder = useRenameFolder();

  const handleRename = async () => {
    if (newName.trim() && newName !== name) {
      await renameFolder.mutateAsync({ id, name: newName.trim(), parentId });
    }
    setRenaming(false);
    setMenuOpen(false);
  };

  const handleDelete = async () => {
    if (confirm(`Delete "${name}" and move its contents to root?`)) {
      await deleteFolder.mutateAsync({ id, parentId });
    }
    setMenuOpen(false);
  };

  return (
    <div
      className="relative group rounded-xl p-4 flex flex-col gap-3 cursor-pointer transition-all active:scale-[0.97]"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      onClick={() => !menuOpen && !renaming && onClick()}
    >
      {/* Folder icon */}
      <div className="flex items-center justify-between">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,60,110,0.12)' }}>
          <Folder size={22} fill="rgba(255,60,110,0.3)" style={{ color: 'var(--red)' }} />
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v); }}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-3)', background: 'var(--surface-2)' }}
        >
          <MoreVertical size={13} />
        </button>
      </div>

      {/* Name */}
      {renaming ? (
        <input
          autoFocus
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setRenaming(false); setMenuOpen(false); } }}
          onClick={(e) => e.stopPropagation()}
          className="text-[13px] font-medium rounded px-1 outline-none w-full"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)' }}
        />
      ) : (
        <div>
          <p className="text-[13px] font-medium truncate" style={{ color: 'var(--text)' }}>{name}</p>
          <p className="font-mono text-[10px] mt-0.5" style={{ color: 'var(--text-3)' }}>
            {clipCount} {clipCount === 1 ? 'file' : 'files'}
          </p>
        </div>
      )}

      {/* Context menu */}
      {menuOpen && (
        <div
          className="absolute right-3 top-12 z-20 rounded-lg overflow-hidden shadow-lg"
          style={{ background: 'var(--surface-3)', border: '1px solid var(--border-2)', minWidth: 140 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => { setRenaming(true); setMenuOpen(false); }}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-left transition-colors hover:bg-white/5"
            style={{ color: 'var(--text-2)' }}
          >
            <Pencil size={12} /> Rename
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-[12px] text-left transition-colors hover:bg-white/5"
            style={{ color: 'var(--red)' }}
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
