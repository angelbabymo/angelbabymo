'use client';
import { VaultItem as VaultItemType } from '@/types';
import { useUpdateVaultItem, useDeleteVaultItem } from '@/hooks/useVault';
import { CheckCircle, Trash2, ExternalLink, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface VaultItemProps {
  item: VaultItemType;
  index: number;
}

const TYPE_COLORS: Record<string, string> = {
  'Hook Idea':                'var(--red)',
  'Trend Observation':        'var(--cyan)',
  'Viral Reference':          'var(--violet)',
  'Competitor Inspiration':   'var(--gold)',
  'Brand Concept':            'var(--green)',
};

const PRIORITY_COLORS: Record<string, string> = {
  high:   'var(--red)',
  normal: 'var(--text-3)',
  low:    'var(--text-3)',
};

export function VaultItem({ item, index }: VaultItemProps) {
  const update = useUpdateVaultItem();
  const del    = useDeleteVaultItem();
  const router = useRouter();
  const typeColor = TYPE_COLORS[item.type] ?? 'var(--text-2)';

  const sendToGenerator = () => {
    sessionStorage.setItem('vault_to_generator', item.content);
    router.push('/generator');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group relative flex flex-col gap-3 p-4 rounded-xl card-hover"
      style={{
        background: item.is_used ? 'var(--surface)' : 'var(--surface)',
        border: `1px solid ${item.is_used ? 'var(--border)' : 'var(--border)'}`,
        opacity: item.is_used ? 0.55 : 1,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="tag" style={{ color: typeColor, background: `${typeColor}18` }}>
            {item.type}
          </span>
          {item.priority === 'high' && (
            <span className="tag" style={{ color: 'var(--red)', background: 'var(--red-dim)' }}>
              HIGH
            </span>
          )}
          {item.is_used && (
            <span className="tag" style={{ color: 'var(--text-3)', background: 'var(--surface-3)' }}>
              USED
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={sendToGenerator}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--red)' }}
            aria-label="Send to generator"
          >
            <Zap size={12} />
          </button>
          <button
            onClick={() => update.mutate({ id: item.id, is_used: !item.is_used })}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: item.is_used ? 'var(--text-3)' : 'var(--green)' }}
            aria-label="Toggle used"
          >
            <CheckCircle size={12} />
          </button>
          <button
            onClick={() => del.mutate(item.id)}
            className="p-1.5 rounded-lg transition-all"
            style={{ color: 'var(--text-3)' }}
            aria-label="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Content */}
      <p className="text-[13px] leading-relaxed" style={{ color: 'var(--text)' }}>
        {item.content}
      </p>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ background: 'var(--surface-3)', color: 'var(--text-3)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px]" style={{ color: 'var(--text-3)' }}>
          {format(new Date(item.created_at), 'MMM d, yyyy')}
        </span>
        {item.source_url && (
          <a
            href={item.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 font-mono text-[10px]"
            style={{ color: 'var(--text-3)' }}
          >
            Source <ExternalLink size={10} />
          </a>
        )}
      </div>
    </motion.div>
  );
}
