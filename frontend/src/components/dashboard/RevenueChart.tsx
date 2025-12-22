import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface RevenueChartProps {
  data: Record<string, number>;
  title?: string;
  type?: 'line' | 'area';
}

export default function RevenueChart({
  data,
  title = 'Revenue Over Time',
  type = 'area',
}: RevenueChartProps) {
  const chartData = useMemo(() => {
    return Object.entries(data)
      .map(([date, revenue]) => ({
        date: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        }),
        revenue,
        fullDate: date,
      }))
      .sort((a, b) => new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 rounded-2xl shadow-organic-lg border-0 texture-paper">
          <p className="text-xs text-muted-foreground font-display mb-1">{payload[0].payload.date}</p>
          <p className="text-xl font-bold font-mono text-primary tabular-nums">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(13, 62%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(13, 62%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontFamily="Manrope, sans-serif"
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, opacity: 0.2 }} />
              <Area
                type="natural"
                dataKey="revenue"
                stroke="hsl(13, 62%, 60%)"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6, fill: 'hsl(13, 62%, 60%)', strokeWidth: 0 }}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontFamily="Manrope, sans-serif"
                tickLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                fontFamily="JetBrains Mono, monospace"
                tickFormatter={(value) => `$${value}`}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 2, opacity: 0.2 }} />
              <Line
                type="natural"
                dataKey="revenue"
                stroke="hsl(13, 62%, 60%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(13, 62%, 60%)', r: 4, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: 'hsl(13, 62%, 60%)', strokeWidth: 0 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
