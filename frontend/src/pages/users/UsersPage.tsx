import { useState } from 'react';
import { Navigate } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Users as UsersIcon } from 'lucide-react';
import { usersApi } from '@/api/misc';
import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { getErrorMessage } from '@/api/getErrorMessage';
import { useToast } from '@/components/ui/Toast';
import { Role } from '@/types';
import { CreateUserModal } from '@/components/users/CreateUserModal';

export function UsersPage() {
  const currentUser = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
    enabled: currentUser?.role === 'ADMIN',
  });

  if (currentUser?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" />;
  }

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) => usersApi.update(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      showToast('Role updated');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
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
            Manage accounts, roles, and access.
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus size={16} /> New User
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : data?.users.length === 0 ? (
        <EmptyState icon={UsersIcon} title="No users yet" description="Create the first account." />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs text-[var(--color-text-muted)]">
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium">Role</th>
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
                      <option value="ADMIN">Admin</option>
                      <option value="PROJECT_MANAGER">Project Manager</option>
                      <option value="TEAM_MEMBER">Team Member</option>
                    </Select>
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
