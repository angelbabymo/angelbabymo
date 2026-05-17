'use client';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'ghost' | 'danger' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary: 'text-white font-semibold',
  ghost:   'font-medium',
  danger:  'text-white font-semibold',
  outline: 'font-medium',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[12px] rounded-lg',
  md: 'px-4 py-2 text-[13px] rounded-lg',
  lg: 'px-5 py-2.5 text-sm rounded-xl',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, disabled, style, ...props }, ref) => {
    const variantStyle: React.CSSProperties = variant === 'primary'
      ? { background: 'var(--red)', border: '1px solid var(--red)' }
      : variant === 'ghost'
      ? { background: 'transparent', border: '1px solid transparent', color: 'var(--text-2)' }
      : variant === 'danger'
      ? { background: '#7f1d1d', border: '1px solid #991b1b' }
      : { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text-2)' };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        style={{ ...variantStyle, ...style }}
        className={cn(
          'inline-flex items-center gap-2 transition-all duration-150 cursor-pointer',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          styles[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';
