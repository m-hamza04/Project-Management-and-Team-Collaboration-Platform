import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-[var(--color-accent)] text-[#151007] hover:bg-[var(--color-accent-hover)]',
        variant === 'secondary' &&
          'bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-hover)]',
        variant === 'ghost' &&
          'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-white/5',
        variant === 'danger' && 'bg-[rgba(255,107,91,0.14)] text-[var(--color-danger)] hover:bg-[rgba(255,107,91,0.22)]',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
