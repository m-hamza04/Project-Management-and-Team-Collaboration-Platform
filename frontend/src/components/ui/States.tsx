import { LucideIcon } from 'lucide-react';

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-white/5 ${className}`} />;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-border)] py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 text-[var(--color-text-faint)]">
        <Icon size={20} />
      </div>
      <h3 className="font-[var(--font-display)] text-base font-semibold">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-[var(--color-text-muted)]">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
