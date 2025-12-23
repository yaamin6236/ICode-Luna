import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, XCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@clerk/clerk-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import RevenueChart from '@/components/dashboard/RevenueChart';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useRevenue, useDashboardSummary } from '@/hooks/useAnalytics';
import { setClerkTokenGetter } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const { getToken } = useAuth();
  
  // Set up Clerk token getter for API requests
  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);
  const [dateRange] = useState({
    start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const { data: revenueData } = useRevenue(dateRange);
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-5xl font-display font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
            All-time revenue and performance metrics
          </p>
        </motion.div>

        {/* Revenue KPIs - All Time */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <KPICard
              title="Total Enrolled Revenue"
              value={`$${(summary?.totalEnrolledRevenue || 0).toLocaleString()}`}
              subtitle="All-time enrolled"
              icon={DollarSign}
              variant="success"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <KPICard
              title="Cancelled Revenue"
              value={`$${(summary?.totalCancelledRevenue || 0).toLocaleString()}`}
              subtitle="Lost to cancellations"
              icon={XCircle}
              variant="warning"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <KPICard
              title="Net Revenue"
              value={`$${(summary?.netRevenue || 0).toLocaleString()}`}
              subtitle="Enrolled - Cancelled"
              icon={TrendingUp}
              variant="primary"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <KPICard
              title="Outstanding"
              value={`$${(summary?.outstandingBalance || 0).toLocaleString()}`}
              subtitle="Pending payment"
              icon={BarChart3}
              variant="default"
            />
          </motion.div>
        </div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <RevenueChart
            data={revenueData?.revenueByDate || {}}
            title="Revenue Trend (Last 30 Days)"
            type="area"
          />

          {/* Revenue by Camp Type - Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                Revenue by Camp Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campTypeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={campTypeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis
                      dataKey="name"
                      fontSize={11}
                      fontFamily="Manrope, sans-serif"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickLine={false}
                    />
                    <YAxis
                      fontSize={11}
                      fontFamily="JetBrains Mono, monospace"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      tickFormatter={(value) => `$${value}`}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: 'none',
                        borderRadius: '16px',
                        boxShadow: 'var(--shadow-lg)',
                        fontFamily: 'Manrope, sans-serif',
                      }}
                      cursor={{ fill: 'hsl(var(--primary) / 0.1)' }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="hsl(13, 62%, 60%)"
                      radius={[12, 12, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  <div className="text-center space-y-3">
                    <div className="p-4 bg-primary/10 rounded-2xl inline-block">
                      <BarChart3 className="w-12 h-12 text-primary opacity-50" />
                    </div>
                    <p className="font-display">No camp type data available</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
