import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, FolderKanban } from 'lucide-react';
import { projectsApi } from '@/api/misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { StatusPill } from '@/components/ui/StatusPill';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/api/getErrorMessage';
import { Project, ProjectStatus } from '@/types';
import { CreateProjectModal } from './CreateProjectModal';
import { ProjectDetailModal } from './ProjectDetailModal';

export function ProjectsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Project | null>(null);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['admin-projects', status, search],
    queryFn: () =>
      projectsApi.getAll({
        status: status === 'ALL' ? undefined : status,
        search: search || undefined,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => projectsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-projects'] });
      showToast('Project deleted');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Every project across the organization, at a glance.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New Project
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 w-72">
          <Search size={15} className="text-[var(--color-text-faint)]" />
          <input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value as ProjectStatus | 'ALL')}>
          <option value="ALL">All Statuses</option>
          <option value="PLANNED">Planned</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Create the first project and assign a Project Manager to get started."
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Manager</th>
                <th className="px-5 py-3 font-medium">Priority</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Team</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-black/[0.02]"
                >
                  <td className="px-5 py-3 font-medium">{p.name}</td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">{p.manager.name}</td>
                  <td className="px-5 py-3">
                    <PriorityBadge priority={p.priority} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusPill status={p.status} />
                  </td>
                  <td className="px-5 py-3 font-[var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                    {p.members.length}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(p.id);
                      }}
                      className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
      {selected && <ProjectDetailModal project={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
