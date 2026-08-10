import { Outlet } from '@tanstack/react-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useSocket } from '@/hooks/useSocket';
import { notificationsApi } from '@/api/misc';
import { useToast } from '@/components/ui/Toast';

export function AppLayout() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.getMine(),
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Live push: whenever the backend emits a notification over the socket,
  // drop it into the query cache immediately and surface a toast.
  useSocket((notification) => {
    queryClient.setQueryData(['notifications'], (old: typeof notifications = []) => [
      notification,
      ...old,
    ]);
    showToast(notification.message);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar unreadCount={unreadCount} />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
