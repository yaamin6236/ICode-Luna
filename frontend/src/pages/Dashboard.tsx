import { useState } from 'react';
import { Plus, Users, DollarSign, Calendar, TrendingDown } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import KPICard from '@/components/dashboard/KPICard';
import RegistrationTable from '@/components/dashboard/RegistrationTable';
import SearchFilters from '@/components/dashboard/SearchFilters';
import RegistrationForm from '@/components/forms/RegistrationForm';
import { Button } from '@/components/ui/button';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useDashboardSummary } from '@/hooks/useAnalytics';

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const { data: registrations, isLoading } = useRegistrations(filters);
  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();

  const handleSearch = (newFilters: any) => {
    setFilters({
      parent_email: newFilters.searchTerm,
      status: newFilters.status,
      start_date: newFilters.start_date,
      end_date: newFilters.end_date,
    });
  };

  const handleEdit = (registration: any) => {
    setEditingRegistration(registration);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setEditingRegistration(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage camp registrations and track enrollment
            </p>
          </div>
          <Button className="gradient-primary" onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Registration
          </Button>
        </div>

        {/* Registration Form Modal */}
        <RegistrationForm
          open={formOpen}
          onClose={handleCloseForm}
          registration={editingRegistration}
        />
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Enrolled"
            value={summary?.totalEnrolled || 0}
            icon={Users}
            loading={summaryLoading}
          />
          <KPICard
            title="Revenue (30d)"
            value={summary?.totalRevenue30Days || 0}
            icon={DollarSign}
            format="currency"
            loading={summaryLoading}
          />
          <KPICard
            title="Upcoming Camps"
            value={summary?.upcomingCampsCount || 0}
            icon={Calendar}
            loading={summaryLoading}
          />
          <KPICard
            title="Recent Cancellations"
            value={summary?.recentCancellations || 0}
            icon={TrendingDown}
            loading={summaryLoading}
          />
        </div>

        {/* Search & Filters */}
        <SearchFilters onSearch={handleSearch} />

        {/* Registrations Table */}
        <div>
          <h2 className="text-xl font-semibold mb-4">All Registrations</h2>
          <RegistrationTable
            registrations={registrations || []}
            onEdit={handleEdit}
            loading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

