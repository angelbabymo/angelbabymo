'use client';
import { VaultItem as VaultItemType } from '@/types';
import { VaultItem } from './VaultItem';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Lightbulb, Plus } from 'lucide-react';
import { useUIStore } from '@/stores/ui.store';

interface VaultGridProps {
  items: VaultItemType[];
}

export function VaultGrid({ items }: VaultGridProps) {
  const setAddIdeaOpen = useUIStore((s) => s.setAddIdeaOpen);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="Vault is empty"
        description="Capture hooks, trends, and inspiration before they disappear."
        action={
          <Button onClick={() => setAddIdeaOpen(true)}>
            <Plus size={14} /> Add Idea
          </Button>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <VaultItem key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
