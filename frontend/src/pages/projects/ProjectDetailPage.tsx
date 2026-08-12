import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { Plus, UserPlus, X } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Skeleton } from '@/components/ui/States';
import { KanbanBoard } from '@/components/tasks/KanbanBoard';
import { TaskDetailModal } from '@/components/tasks/TaskDetailModal';
import { CreateTaskModal } from '@/components/tasks/CreateTaskModal';
import { AddMemberModal } from '@/components/projects/AddMemberModal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/api/getErrorMessage';
import { useToast } from '@/components/ui/Toast';
import { Task } from '@/types';

export function ProjectDetailPage() {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', { projectId }],
    queryFn: () => tasksApi.getAll({ projectId }),
    enabled: !!projectId,
  });

  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectsApi.removeMember(projectId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', projectId] });
      showToast('Member removed');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const isManager = user?.role === 'ADMIN' || project?.manager.id === user?.id;

  if (projectLoading || !project) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-[var(--font-display)] text-2xl font-semibold">{project.name}</h1>
            <StatusPill status={project.status} />
          </div>
          <p className="mt-1 max-w-xl text-sm text-[var(--color-text-muted)]">
            {project.description || 'No description provided.'}
          </p>
        </div>
        {isManager && (
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setShowAddMember(true)}>
              <UserPlus size={15} /> Add Member
            </Button>
            <Button onClick={() => setShowCreateTask(true)}>
              <Plus size={15} /> New Task
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Manager</p>
          <p className="mt-1 text-sm font-medium">{project.manager.name}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Timeline</p>
          <p className="mt-1 font-[var(--font-mono)] text-sm">
            {new Date(project.startDate).toLocaleDateString()} –{' '}
            {new Date(project.endDate).toLocaleDateString()}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-[var(--color-text-muted)]">Priority</p>
          <div className="mt-1.5">
            <PriorityBadge priority={project.priority} />
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <p className="mb-3 text-xs text-[var(--color-text-muted)]">
          Team ({project.members.length})
        </p>
        <div className="flex flex-wrap gap-2">
          {project.members.length === 0 ? (
            <p className="text-xs text-[var(--color-text-faint)]">No team members added yet.</p>
          ) : (
            project.members.map((m) => (
              <div
                key={m.user.id}
                className="flex items-center gap-2 rounded-full bg-black/[0.04] py-1 pl-3 pr-1.5 text-xs"
              >
                {m.user.name}
                {isManager && (
                  <button
                    onClick={() => removeMemberMutation.mutate(m.user.id)}
                    className="flex h-4 w-4 items-center justify-center rounded-full text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
                  >
                    <X size={11} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      <div>
        <h2 className="mb-3 font-[var(--font-display)] text-base font-semibold">Tasks</h2>
        {tasksLoading ? (
          <Skeleton className="h-64" />
        ) : (
          <KanbanBoard tasks={tasks} onTaskClick={setSelectedTask} />
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />
      )}
      {showCreateTask && (
        <CreateTaskModal project={project} onClose={() => setShowCreateTask(false)} />
      )}
      {showAddMember && (
        <AddMemberModal project={project} onClose={() => setShowAddMember(false)} />
      )}
    </div>
  );
}
