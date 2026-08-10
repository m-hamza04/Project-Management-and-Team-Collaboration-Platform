import { Link, useRouterState } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Bell,
  User as UserIcon,
  Users,
  LogOut,
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { clsx } from 'clsx';

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
}

export function Sidebar() {
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const items: NavItem[] = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/projects', icon: FolderKanban, label: 'Projects' },
    { to: '/tasks', icon: ListChecks, label: 'Tasks' },
    ...(user?.role === 'ADMIN' ? [{ to: '/users', icon: Users, label: 'Users' }] : []),
    { to: '/notifications', icon: Bell, label: 'Notifications' },
    { to: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <aside className="flex h-full w-[76px] flex-col items-center justify-between border-r border-[var(--color-border)] bg-[var(--color-base)] py-5">
      <div className="flex flex-col items-center gap-1">
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)] font-[var(--font-display)] text-lg font-bold text-[#151007]">
          F
        </div>

        {items.map((item) => {
          const isActive = pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="group relative flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
              title={item.label}
            >
              {isActive && <span className="sidebar-active-pill" />}
              <Icon
                size={19}
                className={clsx('relative z-10', isActive && 'text-[var(--color-accent)]')}
              />
            </Link>
          );
        })}
      </div>

      <button
        onClick={() => dispatch(logout())}
        title="Log out"
        className="flex h-11 w-11 items-center justify-center rounded-xl text-[var(--color-text-muted)] transition-colors hover:bg-[rgba(255,107,91,0.1)] hover:text-[var(--color-danger)]"
      >
        <LogOut size={19} />
      </button>
    </aside>
  );
}
