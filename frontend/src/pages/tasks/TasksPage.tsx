import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { tasksApi } from '@/api/tasks';
import { projectsApi } from '@/api/projects';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { Select } from '@/components/ui/Select';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { Task } from '@/types';
import { ListTodo } from 'lucide-react';

export function TasksPage() {
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', { projectId: projectFilter || undefined }],
    queryFn: () => tasksApi.getAll({ projectId: projectFilter || undefined }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Tasks</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Everything assigned to and around you.
          </p>
        </div>
        <Select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No tasks here"
          description="Tasks assigned to you will show up on this board."
        />
      ) : (
        <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
      )}

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
    </div>
  );
}
