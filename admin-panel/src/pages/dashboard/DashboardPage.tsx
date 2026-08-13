import { useQuery } from '@tanstack/react-query';
import { Users, FolderKanban, ListChecks, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { usersApi, projectsApi, tasksApi } from '@/api/misc';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/States';

const PROJECT_STATUS_COLORS: Record<string, string> = {
  PLANNED: '#A8A8B0',
  ACTIVE: '#6FA89A',
  ON_HOLD: '#E08A5C',
  COMPLETED: '#5C9284',
  CANCELLED: '#E0705C',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
};

export function DashboardPage() {
  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.getAll(),
  });
  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['admin-projects'],
    queryFn: () => projectsApi.getAll(),
  });
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['admin-tasks'],
    queryFn: () => tasksApi.getAll(),
  });

  const isLoading = usersLoading || projectsLoading || tasksLoading;

  const activeProjects = projects.filter((p) => p.status === 'ACTIVE').length;

  const projectStatusData = Object.entries(
    projects.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: status, value: count }));

  const taskStatusData = Object.entries(
    tasks.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([status, count]) => ({ name: TASK_STATUS_LABELS[status] ?? status, count }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-[var(--font-display)] text-2xl font-semibold">System Overview</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          A single view of everything happening across the organization.
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
          <StatCard icon={Users} label="Total Users" value={usersData?.total ?? 0} />
          <StatCard icon={FolderKanban} label="Total Projects" value={projects.length} />
          <StatCard icon={TrendingUp} label="Active Projects" value={activeProjects} />
          <StatCard icon={ListChecks} label="Total Tasks" value={tasks.length} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-[var(--font-display)] text-base font-semibold">
            Projects by Status
          </h2>
          {isLoading ? (
            <Skeleton className="h-56" />
          ) : projects.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-text-faint)]">
              No projects yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={projectStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                >
                  {projectStatusData.map((entry) => (
                    <Cell key={entry.name} fill={PROJECT_STATUS_COLORS[entry.name] ?? '#A8A8B0'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {projectStatusData.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: PROJECT_STATUS_COLORS[entry.name] ?? '#A8A8B0' }}
                />
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-4 font-[var(--font-display)] text-base font-semibold">
            Tasks by Status
          </h2>
          {isLoading ? (
            <Skeleton className="h-56" />
          ) : tasks.length === 0 ? (
            <p className="py-16 text-center text-sm text-[var(--color-text-faint)]">
              No tasks yet.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={taskStatusData}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#767680' }}
                  axisLine={{ stroke: '#E5E4E0' }}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#767680' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip cursor={{ fill: 'rgba(111,168,154,0.08)' }} />
                <Bar dataKey="count" fill="#6FA89A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
