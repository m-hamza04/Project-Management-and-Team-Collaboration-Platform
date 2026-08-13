import { Link, useRouterState } from '@tanstack/react-router';
import { LayoutDashboard, Users, FolderKanban, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/auth/AuthContext';
import { clsx } from 'clsx';

const NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
];

export function Sidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="flex h-full w-60 flex-col justify-between border-r border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-5">
      <div>
        <div className="mb-8 flex items-center gap-2 px-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-accent)] text-[var(--color-accent-text)]">
            <ShieldCheck size={16} />
          </div>
          <div>
            <p className="font-[var(--font-display)] text-sm font-semibold leading-tight">
              Flowdeck
            </p>
            <p className="text-[10px] uppercase tracking-wide text-[var(--color-text-faint)]">
              Admin Console
            </p>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={clsx(
                  'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-[var(--color-accent-muted)] text-[var(--color-accent)]'
                    : 'text-[var(--color-text-muted)] hover:bg-black/[0.03] hover:text-[var(--color-text)]'
                )}
              >
                {isActive && <span className="admin-active-indicator" />}
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-[var(--color-border)] pt-4 px-1">
        <div className="mb-3 px-2">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-[var(--color-text-faint)]">{user?.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(224,112,92,0.1)] hover:text-[var(--color-danger)]"
        >
          <LogOut size={15} /> Log out
        </button>
      </div>
    </aside>
  );
}
