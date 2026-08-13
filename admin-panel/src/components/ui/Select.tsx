import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={id}
          className={`rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors focus:border-[var(--color-accent)] ${className}`}
          {...props}
        />
      </div>
    );
  }
);
Select.displayName = 'Select';
