import { Outlet } from '@tanstack/react-router';
import { Sidebar } from './Sidebar';

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-base)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
