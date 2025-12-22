import { useState } from 'react';
import { Plus, Users, DollarSign, Calendar as CalendarIcon, TrendingDown } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-5xl font-display font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
              Manage camp registrations and track enrollment
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} size="lg" className="shadow-organic-lg">
            <Plus className="w-5 h-5" />
            New Registration
          </Button>
        </motion.div>

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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <KPICard
              title="Total Enrolled"
              value={summary?.totalEnrolled || 0}
              subtitle="Active students"
              icon={Users}
              variant="primary"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <KPICard
              title="Net Revenue"
              value={`$${(summary?.netRevenue || 0).toLocaleString()}`}
              subtitle="All-time (enrolled - cancelled)"
              icon={DollarSign}
              variant="success"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <KPICard
              title="Upcoming Camps"
              value={summary?.upcomingCampsCount || 0}
              subtitle="Next 7 days"
              icon={CalendarIcon}
              variant="default"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <KPICard
              title="Cancellations"
              value={summary?.recentCancellations || 0}
              subtitle="Last 30 days"
              icon={TrendingDown}
              variant="warning"
            />
          </motion.div>
        </div>

        {/* Calendar and Daily View */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Calendar */}
          <div className="lg:col-span-2">
            <EnrollmentCalendar
              registrations={registrations || []}
              onDateClick={handleDateClick}
            />
          </div>

          {/* Daily Enrollments */}
          <div>
            <Card className="p-8 h-full">
              <h3 className="text-xl font-display font-semibold mb-6">
                {selectedDate
                  ? format(selectedDate, 'EEEE, MMM d')
                  : 'Select a Date'}
              </h3>
              {selectedDate && dateEnrollments.length > 0 ? (
                <div className="space-y-3">
                  {dateEnrollments.map((enrollment, index) => (
                    <motion.button
                      key={enrollment._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleEnrollmentClick(enrollment)}
                      className="w-full text-left p-5 rounded-2xl border-2 border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all"
                    >
                      <div className="font-medium font-display text-base">{enrollment.childName}</div>
                      <div className="text-sm text-muted-foreground mt-2">
                        {enrollment.parentName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-2 flex items-center gap-2">
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
                    </motion.button>
                  ))}
                </div>
              ) : selectedDate ? (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No enrollments for this date
                </p>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Click on a calendar date to view enrollments
                </p>
              )}
            </Card>
          </div>
        </motion.div>

        {/* Search & Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          <SearchFilters onSearch={handleSearch} />
        </motion.div>

        {/* Registrations Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-display font-semibold">All Registrations</h2>
            <p className="text-sm text-muted-foreground font-display">
              {registrations?.length || 0} total
            </p>
          </div>
          <RegistrationTable
            registrations={registrations || []}
            onEdit={handleEdit}
            onViewDetails={handleEnrollmentClick}
            loading={isLoading}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
