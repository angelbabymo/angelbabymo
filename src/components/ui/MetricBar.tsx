interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  color?: string;
}

export function MetricBar({ label, value, max, color = 'var(--red)' }: MetricBarProps) {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px]" style={{ color: 'var(--text-3)' }}>{label}</span>
        <span className="font-mono text-[11px] font-bold" style={{ color: 'var(--text-2)' }}>
          {value.toLocaleString()}
        </span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-3)' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}
