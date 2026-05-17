import { formatNumber } from '@/lib/utils';

interface AttributeCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  color?: string;
  bg?: string;
}

export function AttributeCard({ label, value, sublabel, color = 'var(--text)', bg = 'var(--surface)' }: AttributeCardProps) {
  const formatted = typeof value === 'number' ? formatNumber(value) : value;

  return (
    <div
      className="rounded-xl p-5"
      style={{ background: bg, border: '1px solid var(--border)' }}
    >
      <div className="font-mono text-[9px] tracking-[2px] uppercase mb-2" style={{ color: 'var(--text-3)' }}>
        {label}
      </div>
      <div className="font-mono text-2xl font-bold" style={{ color }}>{formatted}</div>
      {sublabel && (
        <div className="font-mono text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>{sublabel}</div>
      )}
    </div>
  );
}
