import { Link } from '@tanstack/react-router';
import { Bell, Search } from 'lucide-react';
import { useAppSelector } from '@/app/hooks';

export function Topbar({ unreadCount }: { unreadCount: number }) {
  const user = useAppSelector((state) => state.auth.user);

  const initials = user?.name
    ?.split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-6">
      <div className="flex items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3.5 py-2 w-80">
        <Search size={16} className="text-[var(--color-text-faint)]" />
        <input
          placeholder="Search projects, tasks..."
          className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--color-text-faint)]"
        />
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)]"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-[var(--color-status-urgent)]" />
          )}
        </Link>

        <Link to="/profile" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xs font-semibold text-[var(--color-accent)]">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium leading-tight">{user?.name}</p>
            <p className="text-xs text-[var(--color-text-muted)] leading-tight">
              {user?.role.replace('_', ' ')}
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
