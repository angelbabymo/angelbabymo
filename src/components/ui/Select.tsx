import { forwardRef, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>}
      <select
        ref={ref}
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)' }}
        className={cn(
          'w-full px-3 py-2 text-[13px] rounded-lg outline-none transition-all cursor-pointer',
          'focus:border-[var(--border-2)]',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label: l }) => (
          <option key={value} value={value}>{l}</option>
        ))}
      </select>
      {error && <span className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</span>}
    </div>
  ),
);
Select.displayName = 'Select';
