import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi, tasksApi } from '@/api/misc';
import { Project, ProjectStatus } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Skeleton } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/api/getErrorMessage';

export function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks', { projectId: project.id }],
    queryFn: () => tasksApi.getAll({ projectId: project.id }),
  });

  const statusMutation = useMutation({
    mutationFn: (status: ProjectStatus) => projectsApi.update(project.id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      showToast('Project status updated');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;
  const progressPct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  return (
    <Modal title={project.name} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <p className="text-sm text-[var(--color-text-muted)]">
          {project.description || 'No description provided.'}
        </p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">Manager</p>
            <p className="mt-0.5 font-medium">{project.manager.name}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">Priority</p>
            <div className="mt-1">
              <PriorityBadge priority={project.priority} />
            </div>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">Start Date</p>
            <p className="mt-0.5 font-[var(--font-mono)]">
              {new Date(project.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-faint)]">End Date</p>
            <p className="mt-0.5 font-[var(--font-mono)]">
              {new Date(project.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <Select
          label="Status"
          value={project.status}
          onChange={(e) => statusMutation.mutate(e.target.value as ProjectStatus)}
        >
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>

        <div>
          <p className="mb-2 text-xs text-[var(--color-text-faint)]">
            Team ({project.members.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.members.length === 0 ? (
              <p className="text-xs text-[var(--color-text-faint)]">No members added yet.</p>
            ) : (
              project.members.map((m) => (
                <span
                  key={m.user.id}
                  className="rounded-full bg-black/[0.04] px-3 py-1 text-xs"
                >
                  {m.user.name}
                </span>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-[var(--color-text-faint)]">Task Progress</p>
            <span className="font-[var(--font-mono)] text-xs text-[var(--color-text-muted)]">
              {completed}/{tasks.length} completed
            </span>
          </div>
          {tasksLoading ? (
            <Skeleton className="h-2" />
          ) : (
            <div className="h-2 w-full overflow-hidden rounded-full bg-black/[0.06]">
              <div
                className="h-full rounded-full bg-[var(--color-accent)] transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
