import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import { notificationsApi } from '@/api/misc';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton, EmptyState } from '@/components/ui/States';
import { clsx } from 'clsx';

const TYPE_LABELS: Record<string, string> = {
  TASK_ASSIGNED: 'Task Assigned',
  TASK_STATUS_UPDATED: 'Status Update',
  DISCUSSION_ADDED: 'New Message',
  DEADLINE_APPROACHING: 'Deadline',
  PROJECT_ASSIGNED: 'Project',
  ATTACHMENT_ADDED: 'Attachment',
};

export function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMine(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[var(--font-display)] text-2xl font-semibold">Notifications</h1>
        {unreadCount > 0 && (
          <Button variant="secondary" onClick={() => markAllMutation.mutate()}>
            <CheckCheck size={15} /> Mark all as read
          </Button>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="h-64" />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New task assignments, status updates, and messages will appear here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
              className={clsx(
                'flex cursor-pointer items-start justify-between p-4 transition-colors hover:border-[var(--color-border-strong)]',
                !n.isRead && 'border-l-2 border-l-[var(--color-accent)]'
              )}
            >
              <div>
                <span className="text-xs font-medium text-[var(--color-accent)]">
                  {TYPE_LABELS[n.type] ?? n.type}
                </span>
                <p className="mt-1 text-sm">{n.message}</p>
                <p className="mt-1 text-xs text-[var(--color-text-faint)]">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.isRead && (
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[var(--color-accent)]" />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
