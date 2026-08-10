import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { usersApi } from '@/api/misc';
import { Project } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/api/getErrorMessage';

export function AddMemberModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [userId, setUserId] = useState('');
  const [error, setError] = useState('');

  const { data: teamData } = useQuery({
    queryKey: ['users', 'TEAM_MEMBER'],
    queryFn: () => usersApi.getAll({ role: 'TEAM_MEMBER' }),
  });

  const existingIds = new Set(project.members.map((m) => m.user.id));
  const availableUsers = teamData?.users.filter((u) => !existingIds.has(u.id)) ?? [];

  const mutation = useMutation({
    mutationFn: () => projectsApi.addMember(project.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', project.id] });
      showToast('Member added');
      onClose();
    },
    onError: (err) => setError(getErrorMessage(err)),
  });

  return (
    <Modal title="Add Team Member" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <Select label="Team member" value={userId} onChange={(e) => setUserId(e.target.value)}>
          <option value="">Select a person</option>
          {availableUsers.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </Select>

        {availableUsers.length === 0 && (
          <p className="text-xs text-[var(--color-text-muted)]">
            No available team members to add. Create one from the Users page first.
          </p>
        )}

        {error && (
          <p className="rounded-lg bg-[rgba(255,107,91,0.1)] px-3 py-2 text-sm text-[var(--color-danger)]">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!userId}
            isLoading={mutation.isPending}
            onClick={() => {
              setError('');
              mutation.mutate();
            }}
          >
            Add Member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
