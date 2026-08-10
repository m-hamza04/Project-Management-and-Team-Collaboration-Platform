import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { Plus, Search, FolderKanban } from 'lucide-react';
import { projectsApi } from '@/api/projects';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusPill } from '@/components/ui/StatusPill';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { ProjectStatus } from '@/types';
import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

const STATUS_FILTERS: (ProjectStatus | 'ALL')[] = [
  'ALL',
  'PLANNED',
  'ACTIVE',
  'ON_HOLD',
  'COMPLETED',
  'CANCELLED',
];

export function ProjectsPage() {
  const user = useAppSelector((state) => state.auth.user);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<ProjectStatus | 'ALL'>('ALL');
  const [showCreate, setShowCreate] = useState(false);

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', status, search],
    queryFn: () =>
      projectsApi.getAll({
        status: status === 'ALL' ? undefined : status,
        search: search || undefined,
      }),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Projects</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {user?.role === 'TEAM_MEMBER'
              ? 'Projects you are a part of.'
              : user?.role === 'PROJECT_MANAGER'
              ? 'Projects assigned to you.'
              : 'All projects across the organization.'}
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} /> New Project
          </Button>
        )}
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
        <div className="flex gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                  : 'text-[var(--color-text-muted)] hover:bg-white/5'
              }`}
            >
              {s === 'ALL' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="No projects found"
          description="Try adjusting your filters, or check back once a project is assigned to you."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} to="/projects/$projectId" params={{ projectId: project.id }}>
              <Card className="h-full p-5 hover:border-[var(--color-border-strong)] transition-colors">
                <div className="flex items-start justify-between">
                  <h3 className="font-[var(--font-display)] text-base font-semibold pr-2">
                    {project.name}
                  </h3>
                  <StatusPill status={project.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                  {project.description || 'No description provided.'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <PriorityBadge priority={project.priority} />
                  <span className="text-xs text-[var(--color-text-faint)] font-[var(--font-mono)]">
                    {project._count?.tasks ?? 0} tasks
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateProjectModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
