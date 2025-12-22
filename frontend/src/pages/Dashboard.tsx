import { useState, useMemo, useEffect } from 'react';
import { Plus, Users, DollarSign, Calendar as CalendarIcon, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
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
import { registrationAPI } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Auto-select today
  const [dateRegistrations, setDateRegistrations] = useState<any[]>([]);
  const [dateEnrollments, setDateEnrollments] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateStatusFilter, setDateStatusFilter] = useState<'all' | 'enrolled' | 'cancelled'>('all');
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [isLoadingDateData, setIsLoadingDateData] = useState(false);
  const itemsPerPage = 10;

  // Fetch all registrations for calendar display (need all dates to show enrollment dots)
  const { data: allRegistrations } = useRegistrations({ limit: 500 });
  const { data: summary } = useDashboardSummary();

  // When a date is selected, fetch registrations for that specific date
  useEffect(() => {
    if (selectedDate) {
      setIsLoadingDateData(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      registrationAPI.getByCampDate(dateStr)
        .then((data) => {
          setDateRegistrations(data);
          setIsLoadingDateData(false);
        })
        .catch((error) => {
          console.error('Error fetching date registrations:', error);
          setIsLoadingDateData(false);
        });
    } else {
      // Clear date registrations when no date is selected
      setDateRegistrations([]);
    }
  }, [selectedDate]);

  // Always display dateRegistrations (which are fetched based on selected date)
  const displayRegistrations = dateRegistrations;

  // Filter by local search term and status filter
  const filteredRegistrations = useMemo(() => {
    let filtered = displayRegistrations;
    
    // Local search filter (when viewing a specific date)
    if (localSearchTerm && selectedDate) {
      const term = localSearchTerm.toLowerCase();
      filtered = filtered.filter((reg: any) => 
        reg.childName?.toLowerCase().includes(term) ||
        reg.parentName?.toLowerCase().includes(term) ||
        reg.parentEmail?.toLowerCase().includes(term)
      );
    }
    
    return filtered;
  }, [displayRegistrations, localSearchTerm, selectedDate]);

  // Paginated registrations
  const paginatedRegistrations = useMemo(() => {
    const data = filteredRegistrations || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [filteredRegistrations, currentPage]);

  const totalPages = Math.ceil((filteredRegistrations?.length || 0) / itemsPerPage);

  // Filter date enrollments by status
  const filteredDateEnrollments = useMemo(() => {
    if (dateStatusFilter === 'all') return dateEnrollments;
    return dateEnrollments.filter(e => e.status === dateStatusFilter);
  }, [dateEnrollments, dateStatusFilter]);

  const handleSearch = (newFilters: any) => {
    // Use local search on the date-filtered results
    setLocalSearchTerm(newFilters.searchTerm || '');
    setCurrentPage(1);
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
    setDateStatusFilter('all');
    setLocalSearchTerm('');
    setCurrentPage(1);
  };

  const handleClearDateFilter = () => {
    setSelectedDate(new Date()); // Reset to today instead of clearing
    setDateEnrollments([]);
    setLocalSearchTerm('');
    setCurrentPage(1);
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
              registrations={allRegistrations || []}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </div>

          {/* Daily Enrollments */}
          <div>
            <Card className="p-8 h-full">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-display font-semibold">
                  {selectedDate
                    ? format(selectedDate, 'EEEE, MMM d')
                    : 'Select a Date'}
                </h3>
                {selectedDate && (
                  <span className="text-sm font-mono font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {dateEnrollments.length}
                  </span>
                )}
              </div>

              {selectedDate && dateEnrollments.length > 0 ? (
                <div className="space-y-4">
                  {/* Status Filter */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setDateStatusFilter('all')}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium font-display transition-all",
                        dateStatusFilter === 'all'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      All ({dateEnrollments.length})
                    </button>
                    <button
                      onClick={() => setDateStatusFilter('enrolled')}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium font-display transition-all",
                        dateStatusFilter === 'enrolled'
                          ? 'bg-secondary text-secondary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      Enrolled ({dateEnrollments.filter(e => e.status === 'enrolled').length})
                    </button>
                    <button
                      onClick={() => setDateStatusFilter('cancelled')}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium font-display transition-all",
                        dateStatusFilter === 'cancelled'
                          ? 'bg-destructive text-destructive-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      )}
                    >
                      Cancelled ({dateEnrollments.filter(e => e.status === 'cancelled').length})
                    </button>
                  </div>

                  {/* Enrollments List */}
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {filteredDateEnrollments.map((enrollment, index) => (
                      <motion.button
                        key={enrollment._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleEnrollmentClick(enrollment)}
                        className="w-full text-left p-5 rounded-2xl border-2 border-border/50 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium font-display text-base">{enrollment.childName}</div>
                            <div className="text-sm text-muted-foreground mt-2">
                              {enrollment.parentName}
                            </div>
                            <div className="text-xs text-muted-foreground mt-2">
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
                          </div>
                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full font-medium',
                              enrollment.status === 'enrolled'
                                ? 'bg-secondary/15 text-secondary'
                                : 'bg-destructive/15 text-destructive'
                            )}
                          >
                            {enrollment.status}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
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
          className={cn(
            "rounded-2xl p-6 transition-all",
            selectedDate && "bg-primary/5 border-2 border-primary/20"
          )}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <>
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-semibold">
                      {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                        ? "Today's camp registrations"
                        : 'Registrations with camps on this date'}
                    </p>
                  </div>
                </div>
                {selectedDate && format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearDateFilter}
                    className="rounded-full"
                  >
                    ← Back to Today
                  </Button>
                )}
              </>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold font-mono">
                {paginatedRegistrations?.length || 0} <span className="text-muted-foreground text-sm">of</span> {filteredRegistrations?.length || 0}
              </p>
              <p className="text-xs text-muted-foreground font-display mt-1">
                registrations for {selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') ? 'today' : 'selected date'}
              </p>
            </div>
          </div>
          <RegistrationTable
            registrations={paginatedRegistrations || []}
            onEdit={handleEdit}
            onViewDetails={handleEnrollmentClick}
            loading={isLoadingDateData}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-xl"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-xl"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
