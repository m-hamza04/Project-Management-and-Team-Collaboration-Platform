import { useState, FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { usersApi } from '@/api/misc';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/api/getErrorMessage';
import { Priority } from '@/types';

export function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'MEDIUM' as Priority,
    managerId: '',
  });

  const { data: managersData } = useQuery({
    queryKey: ['users', 'PROJECT_MANAGER'],
    queryFn: () => usersApi.getAll({ role: 'PROJECT_MANAGER' }),
  });

  const mutation = useMutation({
    mutationFn: () => projectsApi.create(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      showToast('Project created');
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) return setError('Project name is required.');
    if (!form.startDate || !form.endDate) return setError('Set both a start and end date.');
    if (!form.managerId) return setError('Assign a Project Manager.');
    mutation.mutate();
  };

  return (
    <Modal title="New Project" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Project name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="Start date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
          />
          <Input
            type="date"
            label="End date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
          />
        </div>
        <Select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
          <option value="URGENT">Urgent</option>
        </Select>
        <Select
          label="Project Manager"
          value={form.managerId}
          onChange={(e) => setForm({ ...form, managerId: e.target.value })}
        >
          <option value="">Select a manager</option>
          {managersData?.users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        {managersData && managersData.users.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            No Project Managers exist yet. Create one from the Users page first.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-[rgba(224,112,92,0.1)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="mt-2 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={mutation.isPending}>
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
}
