import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-5"
        style={{ background: 'var(--surface-3)', border: '1px solid var(--border)' }}
      >
        <Icon size={22} style={{ color: 'var(--text-3)' }} />
      </div>
      <h3 className="font-display tracking-widest text-base mb-2" style={{ color: 'var(--text)' }}>
        {title.toUpperCase()}
      </h3>
      <p className="text-[13px] max-w-xs mb-6" style={{ color: 'var(--text-3)' }}>
        {description}
      </p>
      {action}
    </div>
  );
}
