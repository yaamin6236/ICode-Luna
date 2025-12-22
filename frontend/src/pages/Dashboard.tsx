import { useState } from 'react';
import { Plus, Users, DollarSign, Calendar as CalendarIcon, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { KPICard } from '@/components/dashboard/KPICard';
import RegistrationTable from '@/components/dashboard/RegistrationTable';
import SearchFilters from '@/components/dashboard/SearchFilters';
import { EnrollmentCalendar } from '@/components/dashboard/EnrollmentCalendar';
import { EnrollmentDetailModal } from '@/components/dashboard/EnrollmentDetailModal';
import RegistrationForm from '@/components/forms/RegistrationForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRegistrations } from '@/hooks/useRegistrations';
import { useDashboardSummary } from '@/hooks/useAnalytics';

export default function Dashboard() {
  const [filters, setFilters] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dateEnrollments, setDateEnrollments] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

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

  const handleDateClick = (date: Date, enrollments: any[]) => {
    setSelectedDate(date);
    setDateEnrollments(enrollments);
  };

  const handleEnrollmentClick = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setDetailModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Manage camp registrations and track enrollment
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} size="lg">
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

        {/* Enrollment Detail Modal */}
        <EnrollmentDetailModal
          enrollment={selectedEnrollment}
          isOpen={detailModalOpen}
          onClose={() => {
            setDetailModalOpen(false);
            setSelectedEnrollment(null);
          }}
        />

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard
            title="Total Enrolled"
            value={summary?.totalEnrolled || 0}
            subtitle="Active students"
            icon={Users}
            variant="primary"
          />
          <KPICard
            title="Net Revenue"
            value={`$${(summary?.netRevenue || 0).toLocaleString()}`}
            subtitle="All-time (enrolled - cancelled)"
            icon={DollarSign}
            variant="success"
          />
          <KPICard
            title="Upcoming Camps"
            value={summary?.upcomingCampsCount || 0}
            subtitle="Next 7 days"
            icon={CalendarIcon}
            variant="default"
          />
          <KPICard
            title="Cancellations"
            value={summary?.recentCancellations || 0}
            subtitle="Last 30 days"
            icon={TrendingDown}
            variant="warning"
          />
        </div>

        {/* Calendar and Daily View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <EnrollmentCalendar
              registrations={registrations || []}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Daily Enrollments */}
          <div>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMM d')
                  : 'Select a Date'}
              </h3>
              {selectedDate && dateEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {dateEnrollments.map((enrollment) => (
                    <button
                      key={enrollment._id}
                      onClick={() => handleEnrollmentClick(enrollment)}
                      className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent/5 hover:border-primary/30 transition-all"
                    >
                      <div className="font-medium">{enrollment.childName}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {enrollment.parentName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {enrollment.campDates.find((d: any) =>
                          selectedDate
                            ? new Date(d.date).toDateString() ===
                              selectedDate.toDateString()
                            : false
                        )?.startTime}{' '}
                        -{' '}
                        {enrollment.campDates.find((d: any) =>
                          selectedDate
                            ? new Date(d.date).toDateString() ===
                              selectedDate.toDateString()
                            : false
                        )?.endTime}
                      </div>
                    </button>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-muted-foreground">
                  No enrollments for this date
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Click on a calendar date to view enrollments
                </p>
              )}
            </Card>
          </div>
        </div>

        {/* Search & Filters */}
        <SearchFilters onSearch={handleSearch} />

        {/* Registrations Table */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">All Registrations</h2>
            <p className="text-sm text-muted-foreground">
              {registrations?.length || 0} total
            </p>
          </div>
          <RegistrationTable
            registrations={registrations || []}
            onEdit={handleEdit}
            onViewDetails={handleEnrollmentClick}
            loading={isLoading}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
