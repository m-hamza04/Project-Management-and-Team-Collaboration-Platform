import { clsx } from 'clsx';

const STATUS_STYLES: Record<string, string> = {
  TODO: 'bg-black/[0.04] text-[var(--color-text-muted)]',
  IN_PROGRESS: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  REVIEW: 'bg-[rgba(224,166,92,0.16)] text-[var(--color-status-medium)]',
  COMPLETED: 'bg-[rgba(111,168,154,0.18)] text-[var(--color-success)]',
  PLANNED: 'bg-black/[0.04] text-[var(--color-text-muted)]',
  ACTIVE: 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]',
  ON_HOLD: 'bg-[rgba(224,138,92,0.16)] text-[var(--color-status-high)]',
  CANCELLED: 'bg-[rgba(224,112,92,0.16)] text-[var(--color-status-urgent)]',
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
