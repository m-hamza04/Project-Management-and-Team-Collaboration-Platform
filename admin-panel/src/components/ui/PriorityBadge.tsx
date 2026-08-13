import { Priority } from '@/types';
import { clsx } from 'clsx';

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; pulse?: boolean }> = {
  LOW: { label: 'Low', color: 'text-[var(--color-status-low)]' },
  MEDIUM: { label: 'Medium', color: 'text-[var(--color-status-medium)]' },
  HIGH: { label: 'High', color: 'text-[var(--color-status-high)]' },
  URGENT: { label: 'Urgent', color: 'text-[var(--color-status-urgent)]', pulse: true },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const config = PRIORITY_CONFIG[priority];
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium text-[var(--color-text-muted)]">
      <span
        className={clsx('orbit-dot', config.color, config.pulse && 'orbit-dot-pulse')}
      />
      {config.label}
    </span>
  );
}
