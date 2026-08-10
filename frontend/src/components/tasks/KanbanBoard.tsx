import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';

const COLUMNS: { status: TaskStatus; label: string }[] = [
  { status: 'TODO', label: 'To Do' },
  { status: 'IN_PROGRESS', label: 'In Progress' },
  { status: 'REVIEW', label: 'Review' },
  { status: 'COMPLETED', label: 'Completed' },
];

export function KanbanBoard({
  tasks,
  onTaskClick,
}: {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status);
        return (
          <div key={col.status} className="flex flex-col gap-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-sm font-medium text-[var(--color-text-muted)]">{col.label}</h3>
              <span className="font-[var(--font-mono)] text-xs text-[var(--color-text-faint)]">
                {columnTasks.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5 min-h-[120px]">
              {columnTasks.length === 0 ? (
                <p className="py-6 text-center text-xs text-[var(--color-text-faint)]">Empty</p>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
