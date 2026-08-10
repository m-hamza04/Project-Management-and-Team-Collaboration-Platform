import { Task } from '@/types';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { MessageSquare } from 'lucide-react';

export function TaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const initials = task.assignee?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <button
      onClick={onClick}
      className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-base)] p-3.5 text-left transition-colors hover:border-[var(--color-border-strong)]"
    >
      <p className="text-sm font-medium leading-snug">{task.title}</p>
      <div className="mt-3 flex items-center justify-between">
        <PriorityBadge priority={task.priority} />
        {task.assignee && (
          <div
            title={task.assignee.name}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-[10px] font-semibold text-[var(--color-accent)]"
          >
            {initials}
          </div>
        )}
      </div>
      {(task._count?.discussions ?? 0) > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[var(--color-text-faint)]">
          <MessageSquare size={12} />
          <span className="text-xs">{task._count?.discussions}</span>
        </div>
      )}
    </button>
  );
}
