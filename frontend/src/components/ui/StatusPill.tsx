import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-white/5 text-[var(--color-text-muted)]',
  IN_PROGRESS: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  REVIEW: 'bg-[rgba(61,217,194,0.14)] text-[var(--color-status-low)]',
  COMPLETED: 'bg-[rgba(61,217,194,0.2)] text-[var(--color-success)]',
  PLANNED: 'bg-white/5 text-[var(--color-text-muted)]',
  ACTIVE: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  ON_HOLD: 'bg-[rgba(255,138,91,0.14)] text-[var(--color-status-high)]',
  CANCELLED: 'bg-[rgba(255,107,91,0.14)] text-[var(--color-status-urgent)]',
};

const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
  PLANNED: 'Planned',
  ACTIVE: 'Active',
  ON_HOLD: 'On Hold',
  CANCELLED: 'Cancelled',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
