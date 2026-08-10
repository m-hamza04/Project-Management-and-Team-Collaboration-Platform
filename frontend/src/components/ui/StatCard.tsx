import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        <Icon size={16} className="text-[var(--color-text-faint)]" />
      </div>
      <p className="mt-3 font-[var(--font-display)] text-3xl font-semibold">{value}</p>
    </Card>
  );
}
