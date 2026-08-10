import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={clsx(
        'rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] transition-colors',
        className
      )}
      {...props}
    />
  );
}
