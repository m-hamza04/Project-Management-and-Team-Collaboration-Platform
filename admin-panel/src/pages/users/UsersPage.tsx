import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, Users as UsersIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { usersApi } from '@/api/misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { getErrorMessage } from '@/api/getErrorMessage';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@/types';
import { CreateUserModal } from './CreateUserModal';

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  PROJECT_MANAGER: 'Project Manager',
  TEAM_MEMBER: 'Team Member',
};

export function UsersPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', roleFilter, search],
    queryFn: () =>
      usersApi.getAll({
        role: roleFilter === 'ALL' ? undefined : roleFilter,
        search: search || undefined,
      }),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('Role updated');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.update(id, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('User status updated');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('User removed');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-display)] text-2xl font-semibold">Users</h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Manage every account, role, and permission across the platform.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New User
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 w-72">
          <Search size={15} className="text-[var(--color-text-faint)]" />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
          />
        </div>
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as Role | 'ALL')}>
          <option value="ALL">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="PROJECT_MANAGER">Project Manager</option>
          <option value="TEAM_MEMBER">Team Member</option>
        </Select>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data?.users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users found" description="Try adjusting your search or filters." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {data?.users.map((u) => (
                <tr key={u.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-5 py-3 font-medium">{u.name}</td>
                  <td className="px-5 py-3 text-[var(--color-text-muted)]">{u.email}</td>
                  <td className="px-5 py-3">
                    <Select
                      value={u.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({ id: u.id, role: e.target.value as Role })
                      }
                      className="py-1.5 text-xs"
                    >
                      {Object.entries(ROLE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </Select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() =>
                        toggleActiveMutation.mutate({ id: u.id, isActive: !u.isActive })
                      }
                      className="flex items-center gap-1.5 text-xs"
                    >
                      {u.isActive ? (
                        <>
                          <ToggleRight size={16} className="text-[var(--color-success)]" />
                          <span className="text-[var(--color-text-muted)]">Active</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft size={16} className="text-[var(--color-text-faint)]" />
                          <span className="text-[var(--color-text-faint)]">Inactive</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => deleteMutation.mutate(u.id)}
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

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
