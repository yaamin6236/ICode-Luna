import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: 'currency' | 'number';
  loading?: boolean;
}

export default function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  format = 'number',
  loading = false,
}: KPICardProps) {
  const formattedValue =
    format === 'currency' && typeof value === 'number'
      ? formatCurrency(value)
      : value;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="hover-lift"
    >
      <Card className="glass-effect border-white/20">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
          <div className="p-2 rounded-lg bg-primary/10">
            <Icon className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <>
              <div className="text-3xl font-bold">{formattedValue}</div>
              {trend && (
                <div
                  className={`text-xs mt-2 ${
                    trend.isPositive ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

