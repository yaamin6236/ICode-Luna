import { Card } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
    default: 'bg-card hover:shadow-organic-lg',
    primary: 'bg-gradient-to-br from-primary/5 via-card to-card hover:shadow-glow-warm',
    success: 'bg-gradient-to-br from-secondary/10 via-card to-card hover:shadow-organic-lg',
    warning: 'bg-gradient-to-br from-accent/10 via-card to-card hover:shadow-organic-lg',
  };

  const iconContainerStyles = {
    default: 'bg-primary/10 text-primary',
    primary: 'bg-primary/15 text-primary shadow-glow-warm-sm',
    success: 'bg-secondary/15 text-secondary',
    warning: 'bg-accent/15 text-accent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn('p-8 hover-lift cursor-default', variantStyles[variant])}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <p className="text-xs font-display font-medium text-muted-foreground uppercase tracking-wider">
              {title}
            </p>
            <div className="space-y-2">
              <p className="text-4xl font-display font-bold tracking-tight tabular-nums">
                {value}
              </p>
              {subtitle && (
                <p className="text-sm text-muted-foreground leading-relaxed">{subtitle}</p>
              )}
            </div>
            {trend && (
              <div className="flex items-center gap-2 pt-1">
                <span
                  className={cn(
                    'text-xs font-medium font-display tabular-nums',
                    trend.value > 0
                      ? 'text-secondary'
                      : trend.value < 0
                      ? 'text-destructive'
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
          <motion.div
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'p-4 rounded-2xl transition-all duration-200',
              iconContainerStyles[variant]
            )}
          >
            <Icon className="h-7 w-7" />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
}
