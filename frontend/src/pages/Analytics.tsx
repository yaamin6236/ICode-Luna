import { useState } from 'react';
import { TrendingUp, DollarSign, XCircle, PieChart } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import KPICard from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DailyCapacityView from '@/components/dashboard/DailyCapacityView';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRevenue, useDailyCapacity, useCancellations } from '@/hooks/useAnalytics';
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

export default function Analytics() {
  const [dateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data: revenueData, isLoading: revenueLoading } = useRevenue(dateRange);
  const { data: capacityData, isLoading: capacityLoading } = useDailyCapacity();
  const { data: cancellationData } = useCancellations(dateRange);

  const COLORS = ['hsl(263, 70%, 50%)', 'hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)'];

  const campTypeData = revenueData?.revenueByCampType
    ? Object.entries(revenueData.revenueByCampType).map(([name, value]) => ({
        name,
        value,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-1">
            Track revenue, capacity, and performance metrics
          </p>
        </div>

        {/* Revenue KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <KPICard
            title="Total Revenue"
            value={revenueData?.totalRevenue || 0}
            icon={DollarSign}
            format="currency"
            loading={revenueLoading}
          />
          <KPICard
            title="Amount Paid"
            value={revenueData?.totalPaid || 0}
            icon={TrendingUp}
            format="currency"
            loading={revenueLoading}
          />
          <KPICard
            title="Outstanding Balance"
            value={revenueData?.outstandingBalance || 0}
            icon={XCircle}
            format="currency"
            loading={revenueLoading}
          />
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart
            data={revenueData?.revenueByDate || {}}
            title="Revenue Trend (Last 30 Days)"
            type="area"
          />

          {/* Revenue by Camp Type */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Revenue by Camp Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={campTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {campTypeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No camp type data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Capacity Calendar */}
        <DailyCapacityView
          data={capacityData?.capacityData || []}
          loading={capacityLoading}
        />

        {/* Cancellation Stats */}
        {cancellationData && (
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Cancellation Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">
                    {cancellationData.totalCancellations}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Total Cancellations
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">
                    {formatCurrency(cancellationData.lostRevenue)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Lost Revenue
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <div className="text-2xl font-bold text-destructive">
                    {Object.keys(cancellationData.cancellationsByDate || {}).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Days with Cancellations
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}

