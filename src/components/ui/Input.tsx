import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const baseInput = 'w-full px-3 py-2 text-[13px] rounded-lg outline-none transition-all duration-150';
const inputStyle = {
  background: 'var(--surface-2)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>}
      <input
        ref={ref}
        style={inputStyle}
        className={cn(baseInput, 'placeholder:text-[var(--text-3)] focus:border-[var(--border-2)]', className)}
        {...props}
      />
      {error && <span className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</span>}
    </div>
  ),
);
Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[12px] font-medium" style={{ color: 'var(--text-2)' }}>{label}</label>}
      <textarea
        ref={ref}
        style={inputStyle}
        className={cn(baseInput, 'resize-none placeholder:text-[var(--text-3)] focus:border-[var(--border-2)]', className)}
        {...props}
      />
      {error && <span className="text-[11px]" style={{ color: 'var(--red)' }}>{error}</span>}
    </div>
  ),
);
Textarea.displayName = 'Textarea';
