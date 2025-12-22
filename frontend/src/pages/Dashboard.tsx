import { useState, useMemo, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RegistrationTable from '@/components/dashboard/RegistrationTable';
import SearchFilters from '@/components/dashboard/SearchFilters';
import { EnrollmentCalendar } from '@/components/dashboard/EnrollmentCalendar';
import { EnrollmentDetailModal } from '@/components/dashboard/EnrollmentDetailModal';
import RegistrationForm from '@/components/forms/RegistrationForm';
import { Button } from '@/components/ui/button';
import { useRegistrations } from '@/hooks/useRegistrations';
import { registrationAPI } from '@/lib/api';

export default function Dashboard() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingRegistration, setEditingRegistration] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Auto-select today
  const [dateRegistrations, setDateRegistrations] = useState<any[]>([]);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoadingDateData, setIsLoadingDateData] = useState(false);
  const itemsPerPage = 10;

  // Fetch all registrations for calendar display (need all dates to show enrollment dots)
  const { data: allRegistrations } = useRegistrations({ limit: 500 });

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
    
    // Search filter - search by child name, parent name, or email
    if (localSearchTerm) {
      const term = localSearchTerm.toLowerCase();
      filtered = filtered.filter((reg: any) => 
        reg.childName?.toLowerCase().includes(term) ||
        reg.parentName?.toLowerCase().includes(term) ||
        reg.parentEmail?.toLowerCase().includes(term) ||
        reg.registrationId?.toLowerCase().includes(term)
      );
    }
    
    // Status filter
    if (statusFilter) {
      filtered = filtered.filter((reg: any) => reg.status === statusFilter);
    }
    
    return filtered;
  }, [displayRegistrations, localSearchTerm, statusFilter]);

  // Paginated registrations
  const paginatedRegistrations = useMemo(() => {
    const data = filteredRegistrations || [];
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [filteredRegistrations, currentPage]);

  const totalPages = Math.ceil((filteredRegistrations?.length || 0) / itemsPerPage);

  // Calculate daily stats from the date's registrations (before search/status filters)
  // Revenue is $100 per day per enrollment, NOT the total enrollment cost
  const DAILY_RATE = 100;
  
  const dailyStats = useMemo(() => {
    const enrolled = displayRegistrations.filter((reg: any) => reg.status === 'enrolled');
    const cancelled = displayRegistrations.filter((reg: any) => reg.status === 'cancelled');
    
    // Each enrollment/cancellation for this specific day = $100
    const revenueGained = enrolled.length * DAILY_RATE;
    const revenueLost = cancelled.length * DAILY_RATE;
    
    return {
      enrolledCount: enrolled.length,
      cancelledCount: cancelled.length,
      totalCount: displayRegistrations.length,
      revenueGained,
      revenueLost,
    };
  }, [displayRegistrations]);

  const handleSearch = (newFilters: any) => {
    // Apply all filters locally on the date-filtered results
    setLocalSearchTerm(newFilters.searchTerm || '');
    setStatusFilter(newFilters.status || '');
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

  const handleDateClick = (date: Date, _enrollments: any[]) => {
    setSelectedDate(date);
    setLocalSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleClearDateFilter = () => {
    setSelectedDate(new Date()); // Reset to today instead of clearing
    setLocalSearchTerm('');
    setStatusFilter('');
    setCurrentPage(1);
  };

  const handleEnrollmentClick = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setDetailModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-5xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-3 text-lg leading-relaxed">
            Manage camp registrations and track enrollment
          </p>
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

        {/* Main Content - Side by Side Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <EnrollmentCalendar
              registrations={allRegistrations || []}
              onDateClick={handleDateClick}
              selectedDate={selectedDate}
            />
          </motion.div>

          {/* Right Column - Stats, Search & Registrations Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="flex flex-col gap-4"
          >
            {/* Date Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold">
                    {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today'}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ? "Today's registrations"
                      : 'Selected date'}
                  </p>
                </div>
              </div>
              {selectedDate && format(selectedDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearDateFilter}
                  className="rounded-full text-xs"
                >
                  ← Today
                </Button>
              )}
            </div>

            {/* Daily Summary Stats - Above Search */}
            {selectedDate && (
              <div className="grid grid-cols-4 gap-2">
                {/* Active Enrollments */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-1">Active</div>
                  <div className="text-xl font-bold font-mono text-secondary">
                    {dailyStats.enrolledCount}
                  </div>
                </div>

                {/* Cancelled */}
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-1">Cancelled</div>
                  <div className="text-xl font-bold font-mono text-destructive">
                    {dailyStats.cancelledCount}
                  </div>
                </div>

                {/* Revenue Gained */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-1">Revenue</div>
                  <div className="text-xl font-bold font-mono text-secondary">
                    ${dailyStats.revenueGained.toLocaleString()}
                  </div>
                </div>

                {/* Revenue Lost */}
                <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 text-center">
                  <div className="text-xs font-display uppercase tracking-wide text-muted-foreground mb-1">Lost</div>
                  <div className="text-xl font-bold font-mono text-destructive">
                    ${dailyStats.revenueLost.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Search & Filters */}
            <SearchFilters onSearch={handleSearch} />

            {/* Registrations Table - Full Height */}
            <div className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col flex-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-display text-muted-foreground">
                  Showing {paginatedRegistrations?.length || 0} of {filteredRegistrations?.length || 0}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto min-h-0">
                <RegistrationTable
                  registrations={paginatedRegistrations || []}
                  onEdit={handleEdit}
                  onViewDetails={handleEnrollmentClick}
                  loading={isLoadingDateData}
                />
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
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
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-xl"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
}
