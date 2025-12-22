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
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-effect p-3 rounded-lg border border-white/20">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-primary">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {type === 'area' ? (
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="hsl(263, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(263, 70%, 50%)"
                fillOpacity={1}
                fill="url(#colorRevenue)"
                strokeWidth={2}
              />
            </AreaChart>
          ) : (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(263, 70%, 50%)"
                strokeWidth={3}
                dot={{ fill: 'hsl(263, 70%, 50%)', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

