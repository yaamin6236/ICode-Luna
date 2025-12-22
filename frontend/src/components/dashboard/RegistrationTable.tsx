import { Eye, Mail, Phone, Calendar, MapPin, Hash } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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
  children?: any[];
  registrationId?: string;
  totalCost?: number;
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
            <div
              key={i}
              className="h-20 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card className="p-16 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="max-w-md mx-auto"
        >
          <div className="w-20 h-20 rounded-[20px] bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <Calendar className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-xl font-display font-semibold mb-2">No registrations found</h3>
          <p className="text-muted-foreground leading-relaxed">
            Start by adding a new registration or adjust your filters to see more results.
          </p>
        </motion.div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/30 border-b border-border/50">
              <th className="text-left p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Student(s)
              </th>
              <th className="text-left p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Parent
              </th>
              <th className="text-left p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Contact
              </th>
              <th className="text-left p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Camp Dates
              </th>
              <th className="text-left p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Status & Revenue
              </th>
              <th className="text-right p-5 text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {registrations.map((registration, index) => {
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
                <motion.tr
                  key={registration._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  className={cn(
                    'border-b border-border/30 transition-all duration-200',
                    'hover:bg-primary/5 hover:border-primary/20',
                    index % 2 === 0 ? 'bg-muted/10' : 'bg-transparent'
                  )}
                >
                  {/* Student */}
                  <td className="p-5">
                    <div className="space-y-1.5">
                      <div className="font-display font-semibold">{childrenDisplay}</div>
                      {registration.registrationId && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                          <Hash className="h-3 w-3" />
                          {registration.registrationId}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Parent */}
                  <td className="p-5">
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
                  <td className="p-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate max-w-[200px]">
                          {registration.parentEmail}
                        </span>
                      </div>
                      {registration.parentPhone && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          {registration.parentPhone}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Camp Dates */}
                  <td className="p-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        {dateDisplay}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {totalDays} {totalDays === 1 ? 'day' : 'days'}
                        {numChildren > 1 && ` • ${numChildren} children`}
                      </div>
                    </div>
                  </td>

                  {/* Status & Revenue */}
                  <td className="p-5">
                    <div className="space-y-2">
                      <span
                        className={cn(
                          'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium font-display',
                          isEnrolled
                            ? 'bg-secondary/15 text-secondary border border-secondary/20'
                            : 'bg-destructive/15 text-destructive border border-destructive/20'
                        )}
                      >
                        {isEnrolled ? 'Enrolled' : 'Cancelled'}
                      </span>
                      {registration.totalCost && (
                        <div className={cn(
                          "text-sm font-bold font-mono tabular-nums",
                          isEnrolled ? "text-secondary" : "text-destructive"
                        )}>
                          ${registration.totalCost.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-5">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(registration)}
                        className="rounded-xl"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
