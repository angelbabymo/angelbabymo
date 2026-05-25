'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useCreateFolder } from '@/hooks/useFolders';

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  parentId: string | null;
}

export function CreateFolderModal({ open, onClose, parentId }: CreateFolderModalProps) {
  const [name, setName]   = useState('');
  const createFolder      = useCreateFolder();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await createFolder.mutateAsync({ name: name.trim(), parentId });
    setName('');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Folder">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Folder Name"
          placeholder="e.g. GRWM, Affiliate, Summer 2024"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoFocus
        />
        <div className="flex gap-3 pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={createFolder.isPending} className="ml-auto" disabled={!name.trim()}>
            Create Folder
          </Button>
        </div>
      </form>
    </Modal>
  );
}
