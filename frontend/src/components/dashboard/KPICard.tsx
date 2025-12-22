import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: KPICardProps) {
  const variantStyles = {
    default: 'bg-card border-border',
    primary: 'bg-primary/5 border-primary/20',
    success: 'bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800',
    warning: 'bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800',
  };

  const iconStyles = {
    default: 'text-primary',
    primary: 'text-primary',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
  };

  return (
    <Card className={cn('p-6 hover-lift', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="space-y-1">
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 pt-2">
              <span
                className={cn(
                  'text-xs font-medium',
                  trend.value > 0
                    ? 'text-green-600 dark:text-green-400'
                    : trend.value < 0
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-muted-foreground'
                )}
              >
                {trend.value > 0 && '+'}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn('p-3 rounded-xl bg-background/50', iconStyles[variant])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
