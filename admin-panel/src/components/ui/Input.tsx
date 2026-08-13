import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={clsx(
            'rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-faint)] outline-none transition-colors focus:border-[var(--color-accent)]',
            error && 'border-[var(--color-danger)]',
            className
          )}
          {...props}
        />
        {error && <span className="text-xs text-[var(--color-danger)]">{error}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
