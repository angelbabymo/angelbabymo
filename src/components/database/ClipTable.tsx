'use client';
import { Clip } from '@/types';
import { ClipRow } from './ClipRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Film, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface ClipTableProps {
  clips: Clip[];
}

export function ClipTable({ clips }: ClipTableProps) {
  const setAddClipOpen = useUIStore((s) => s.setAddClipOpen);

  if (clips.length === 0) {
    return (
      <EmptyState
        icon={Film}
        title="No clips yet"
        description="Add your first clip to start tracking performance and generating AI copy."
        action={
          <Button onClick={() => setAddClipOpen(true)}>
            <Plus size={14} /> Add Clip
          </Button>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {clips.map((clip, i) => (
        <ClipRow key={clip.id} clip={clip} index={i} />
      ))}
    </div>
  );
}
