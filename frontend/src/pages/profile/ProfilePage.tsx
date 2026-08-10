import { useAppSelector } from '@/app/hooks';
import { Card } from '@/components/ui/Card';
import { StatusPill } from '@/components/ui/StatusPill';

export function ProfilePage() {
  const user = useAppSelector((state) => state.auth.user);
  if (!user) return null;

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="font-[var(--font-display)] text-2xl font-semibold">Profile</h1>

      <Card className="p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-xl font-semibold text-[var(--color-accent)]">
            {initials}
          </div>
          <div>
            <p className="font-[var(--font-display)] text-lg font-semibold">{user.name}</p>
            <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-[var(--color-border)] pt-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Role</span>
            <span className="text-sm font-medium">{user.role.replace('_', ' ')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Status</span>
            <StatusPill status={user.isActive ? 'ACTIVE' : 'ON_HOLD'} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">Member since</span>
            <span className="font-[var(--font-mono)] text-sm">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
