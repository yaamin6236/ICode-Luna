import { useState } from 'react';
import { TrendingUp, DollarSign, XCircle, BarChart3, Users, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import DailyCapacityView from '@/components/dashboard/DailyCapacityView';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRevenue, useDailyCapacity, useCancellations, useDashboardSummary } from '@/hooks/useAnalytics';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Analytics() {
  const [dateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data: revenueData, isLoading: revenueLoading } = useRevenue(dateRange);
  const { data: capacityData, isLoading: capacityLoading } = useDailyCapacity();
  const { data: cancellationData } = useCancellations(dateRange);
  const { data: summary } = useDashboardSummary();

  const campTypeData = revenueData?.revenueByCampType
    ? Object.entries(revenueData.revenueByCampType).map(([name, value]) => ({
        name,
        revenue: value,
      }))
    : [];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-2">
            All-time revenue and performance metrics
          </p>
        </div>

        {/* Revenue KPIs - All Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <KPICard
            title="Total Enrolled Revenue"
            value={`$${(summary?.totalEnrolledRevenue || 0).toLocaleString()}`}
            subtitle="All-time enrolled"
            icon={DollarSign}
            variant="success"
          />
          <KPICard
            title="Cancelled Revenue"
            value={`$${(summary?.totalCancelledRevenue || 0).toLocaleString()}`}
            subtitle="Lost to cancellations"
            icon={XCircle}
            variant="warning"
          />
          <KPICard
            title="Net Revenue"
            value={`$${(summary?.netRevenue || 0).toLocaleString()}`}
            subtitle="Enrolled - Cancelled"
            icon={TrendingUp}
            variant="primary"
          />
          <KPICard
            title="Outstanding"
            value={`$${(summary?.outstandingBalance || 0).toLocaleString()}`}
            subtitle="Pending payment"
            icon={BarChart3}
            variant="default"
          />
        </div>

        {/* Revenue Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart
            data={revenueData?.revenueByDate || {}}
            title="Revenue Trend (Last 30 Days)"
            type="area"
          />

          {/* Revenue by Camp Type - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Revenue by Camp Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campTypeData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="name"
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(var(--primary))"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No camp type data available</p>
                  </div>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Cancellation Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {cancellationData.totalCancellations}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Total Cancellations
                  </div>
                </div>
                <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    ${cancellationData.lostRevenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
                    Lost Revenue
                  </div>
                </div>
                <div className="p-6 rounded-xl border-2 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {Object.keys(cancellationData.cancellationsByDate || {}).length}
                  </div>
                  <div className="text-sm text-muted-foreground mt-2">
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
