interface BadgeProps {
  label: string;
  color?: string;
  bg?: string;
}

export function Badge({ label, color = 'var(--text-2)', bg = 'var(--surface-3)' }: BadgeProps) {
  return (
    <span
      className="tag"
      style={{ color, background: bg }}
    >
      {label}
    </span>
  );
}
