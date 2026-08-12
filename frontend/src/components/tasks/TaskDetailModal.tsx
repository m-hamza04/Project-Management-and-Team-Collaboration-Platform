import { useState, FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Send, Paperclip, Trash2, Download } from 'lucide-react';
import { Task, TaskStatus } from '@/types';
import { tasksApi } from '@/api/tasks';
import { discussionsApi, attachmentsApi } from '@/api/misc';
import { useAppSelector } from '@/app/hooks';
import { Modal } from '@/components/ui/Modal';
import { Select } from '@/components/ui/Select';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { getErrorMessage } from '@/api/getErrorMessage';

const STATUS_OPTIONS: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED'];

export function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const user = useAppSelector((state) => state.auth.user);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [message, setMessage] = useState('');

  const canUpdateStatus =
    user?.role === 'ADMIN' || user?.id === task.assignee?.id || user?.id === task.project.managerId;

  const { data: discussions = [] } = useQuery({
    queryKey: ['discussions', task.id],
    queryFn: () => discussionsApi.getByTask(task.id),
  });

  const { data: attachments = [] } = useQuery({
    queryKey: ['attachments', task.id],
    queryFn: () => attachmentsApi.getByTask(task.id),
  });

  const statusMutation = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateStatus(task.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      showToast('Task status updated');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const messageMutation = useMutation({
    mutationFn: () => discussionsApi.addMessage(task.id, message),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['discussions', task.id] });
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => attachmentsApi.upload(task.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attachments', task.id] });
      showToast('File attached');
    },
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const deleteAttachmentMutation = useMutation({
    mutationFn: (id: string) => attachmentsApi.remove(task.id, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attachments', task.id] }),
    onError: (err) => showToast(getErrorMessage(err), 'error'),
  });

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    messageMutation.mutate();
  };

  return (
    <Modal title={task.title} onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div>
          <p className="text-sm text-[var(--color-text-muted)]">
            {task.description || 'No description provided.'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <PriorityBadge priority={task.priority} />
            {task.dueDate && (
              <span className="font-[var(--font-mono)] text-xs text-[var(--color-text-faint)]">
                Due {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
            {task.assignee && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Assigned to {task.assignee.name}
              </span>
            )}
          </div>
        </div>

        {canUpdateStatus && (
          <Select
            label="Status"
            value={task.status}
            onChange={(e) => statusMutation.mutate(e.target.value as TaskStatus)}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </Select>
        )}

        {/* Attachments */}
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--color-text-muted)]">Attachments</h4>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-[var(--color-accent)] hover:underline">
              <Paperclip size={13} />
              Attach file
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                }}
              />
            </label>
          </div>
          <div className="mt-2 flex flex-col gap-1.5">
            {attachments.length === 0 ? (
              <p className="text-xs text-[var(--color-text-faint)]">No files attached yet.</p>
            ) : (
              attachments.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-3 py-2"
                >
                  <a
                    href={a.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 text-xs hover:underline"
                  >
                    <Download size={12} />
                    {a.fileName}
                  </a>
                  <button
                    onClick={() => deleteAttachmentMutation.mutate(a.id)}
                    className="text-[var(--color-text-faint)] hover:text-[var(--color-danger)]"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Discussion */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-[var(--color-text-muted)]">Discussion</h4>
          <div className="flex max-h-48 flex-col gap-2.5 overflow-y-auto pr-1">
            {discussions.length === 0 ? (
              <p className="text-xs text-[var(--color-text-faint)]">
                No messages yet. Start the discussion below.
              </p>
            ) : (
              discussions.map((d) => (
                <div key={d.id} className="rounded-lg bg-black/[0.04] px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{d.author.name}</span>
                    <span className="text-[10px] text-[var(--color-text-faint)]">
                      {new Date(d.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="mt-1 text-sm">{d.message}</p>
                </div>
              ))
            )}
          </div>
          <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write a message..."
              className="flex-1 rounded-xl bg-[var(--color-base)] border border-[var(--color-border)] px-3.5 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            />
            <Button type="submit" isLoading={messageMutation.isPending}>
              <Send size={14} />
            </Button>
          </form>
        </div>
      </div>
    </Modal>
  );
}
