export function ScoreBadge({ value, action }: { value: number; action: string }) {
  const bg = value >= 7.5 ? 'var(--red)' : value >= 5 ? '#f59e0b' : 'var(--surface-2)';
  const textColor = value >= 5 ? 'white' : 'var(--text-3)';
  return (
    <div
      className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-xl"
      style={{ background: bg }}
    >
      <span className="text-[17px] font-bold leading-none" style={{ color: textColor }}>{value.toFixed(1)}</span>
      <span className="text-[9px] font-mono mt-0.5" style={{ color: textColor, opacity: 0.85 }}>{action}</span>
    </div>
  );
}
