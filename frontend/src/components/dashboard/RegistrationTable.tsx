import { Eye, Mail, Phone, Calendar, MapPin, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface Registration {
  _id: string;
  childName: string;
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  status: 'enrolled' | 'cancelled';
  campDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
  }>;
  location?: string;
  careRequestNumber?: string;
  employer?: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  onEdit?: (registration: Registration) => void;
  onViewDetails: (registration: Registration) => void;
  loading?: boolean;
}

export default function RegistrationTable({
  registrations,
  onEdit,
  onViewDetails,
  loading = false,
}: RegistrationTableProps) {
  if (loading) {
    return (
      <Card className="overflow-hidden">
        <div className="space-y-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-20 bg-muted/20 animate-pulse border-b" />
          ))}
        </div>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
          <p className="text-muted-foreground text-sm">
            Start by adding a new registration or adjust your filters to see more results.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="text-left p-4 text-sm font-semibold">Student(s)</th>
              <th className="text-left p-4 text-sm font-semibold">Parent</th>
              <th className="text-left p-4 text-sm font-semibold">Contact</th>
              <th className="text-left p-4 text-sm font-semibold">Camp Dates</th>
              <th className="text-left p-4 text-sm font-semibold">Status & Revenue</th>
              <th className="text-right p-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {registrations.map((registration) => {
              const isEnrolled = registration.status === 'enrolled';
              const campDates = registration.campDates || [];
              const firstDate = campDates.length > 0 ? campDates[0] : null;
              const totalDays = campDates.length;

              const numChildren = registration.children?.length || 1;
              const childrenDisplay = numChildren > 1 
                ? `${registration.childName} +${numChildren - 1}` 
                : registration.childName;
              
              // Safely parse date
              let dateDisplay = 'N/A';
              if (firstDate) {
                try {
                  // Handle both string dates and date objects
                  const dateValue = typeof firstDate === 'string' ? firstDate : firstDate.date;
                  if (dateValue) {
                    dateDisplay = format(new Date(dateValue), 'MMM d, yyyy');
                  }
                } catch (e) {
                  console.error('Date parsing error:', e, firstDate);
                  dateDisplay = 'Invalid date';
                }
              }

              return (
                <tr
                  key={registration._id}
                  className="hover:bg-accent/5 transition-colors"
                >
                  {/* Student */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="font-medium">{childrenDisplay}</div>
                      {registration.registrationId && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Hash className="h-3 w-3" />
                          {registration.registrationId}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Parent */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="text-sm font-medium">
                        {registration.parentName}
                      </div>
                      {registration.employer && (
                        <div className="text-xs text-muted-foreground">
                          {registration.employer}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">
                          {registration.parentEmail}
                        </span>
                      </div>
                      {registration.parentPhone && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {registration.parentPhone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Camp Dates */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-sm">
                        <Calendar className="h-3 w-3 text-primary" />
                        {dateDisplay}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {totalDays} {totalDays === 1 ? 'day' : 'days'}
                        {numChildren > 1 && ` • ${numChildren} children`}
                      </div>
                    </div>
                  </td>

                  {/* Status & Revenue */}
                  <td className="p-4">
                    <div className="space-y-1">
                      <span
                        className={cn(
                          'status-badge',
                          isEnrolled
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        )}
                      >
                        {isEnrolled ? 'Enrolled' : 'Cancelled'}
                      </span>
                      {registration.totalCost && (
                        <div className={cn(
                          "text-sm font-semibold",
                          isEnrolled ? "text-green-600" : "text-red-600"
                        )}>
                          ${registration.totalCost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(registration)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
