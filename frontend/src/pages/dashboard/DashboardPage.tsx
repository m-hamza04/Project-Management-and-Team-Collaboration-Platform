import { useQuery } from '@tanstack/react-query';
import { FolderKanban, ListTodo, CheckCircle2, Clock } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';
import { projectsApi } from '@/api/projects';
import { tasksApi } from '@/api/tasks';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { Link } from '@tanstack/react-router';

export function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.getAll(),
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => tasksApi.getAll(),
  });

  const isLoading = projectsLoading || tasksLoading;

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'COMPLETED').length;
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;

  const upcomingDeadlines = tasks
    .filter((t) => t.dueDate && t.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 5);

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrator'
      : user?.role === 'PROJECT_MANAGER'
      ? 'Project Manager'
      : 'Team Member';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-semibold">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {roleLabel} overview — here's where things stand today.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard
            icon={FolderKanban}
            label={user?.role === 'TEAM_MEMBER' ? 'Assigned Projects' : 'Active Projects'}
            value={user?.role === 'TEAM_MEMBER' ? projects.length : activeProjects}
          />
          <StatCard icon={ListTodo} label="Pending Tasks" value={pendingTasks} />
          <StatCard icon={CheckCircle2} label="Completed Tasks" value={completedTasks} />
          <StatCard icon={Clock} label="Upcoming Deadlines" value={upcomingDeadlines.length} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-[var(--font-display)] text-base font-semibold">
            {user?.role === 'TEAM_MEMBER' ? 'Your Projects' : 'Recent Projects'}
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description="Projects assigned to you will show up here."
              />
            ) : (
              projects.slice(0, 5).map((project) => (
                <Link
                  key={project.id}
                  to="/projects/$projectId"
                  params={{ projectId: project.id }}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3 transition-colors hover:border-[var(--color-border-strong)]"
                >
                  <div>
                    <p className="text-sm font-medium">{project.name}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                      {project._count?.tasks ?? 0} tasks
                    </p>
                  </div>
                  <StatusPill status={project.status} />
                </Link>
              ))
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-[var(--font-display)] text-base font-semibold">
            Upcoming Deadlines
          </h2>
          <div className="mt-4 flex flex-col gap-3">
            {isLoading ? (
              <Skeleton className="h-16" />
            ) : upcomingDeadlines.length === 0 ? (
              <EmptyState
                icon={Clock}
                title="Nothing due soon"
                description="Tasks with upcoming due dates will appear here."
              />
            ) : (
              upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium">{task.title}</p>
                    <p className="mt-0.5 font-[var(--font-mono)] text-xs text-[var(--color-text-muted)]">
                      Due {new Date(task.dueDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <PriorityBadge priority={task.priority} />
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
