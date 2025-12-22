import { format } from 'date-fns';
import {
  X,
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  MapPin,
  Hash,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface Registration {
  _id: string;
  childName: string;
  children?: string[];  // Array of all children
  parentName: string;
  parentEmail: string;
  parentPhone?: string;
  employer?: string;
  campDates: Array<{
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
  }>;
  status: 'enrolled' | 'cancelled';
  location?: string;
  registrationId?: string;
  childAge?: string;
  childGender?: string;
  totalCost?: number;
  amountPaid?: number;
}

interface EnrollmentDetailModalProps {
  enrollment: Registration | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EnrollmentDetailModal({
  enrollment,
  isOpen,
  onClose,
}: EnrollmentDetailModalProps) {
  if (!enrollment) return null;

  const isEnrolled = enrollment.status === 'enrolled';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                {enrollment.children && enrollment.children.length > 1
                  ? `${enrollment.children.length} Children`
                  : enrollment.childName}
              </h2>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'status-badge',
                    isEnrolled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  )}
                >
                  {isEnrolled ? (
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                  ) : (
                    <XCircle className="h-3 w-3 mr-1" />
                  )}
                  {isEnrolled ? 'Enrolled' : 'Cancelled'}
                </span>
                {enrollment.registrationId && (
                  <span className="text-sm text-muted-foreground">
                    #{enrollment.registrationId}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Children Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {enrollment.children && enrollment.children.length > 1 ? 'Students' : 'Student Information'}
            </h3>
            {enrollment.children && enrollment.children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrollment.children.map((child, idx) => (
                  <div key={idx} className="p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{child}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Full Name"
                  value={enrollment.childName}
                />
              </div>
            )}
          </div>

          {/* Parent/Guardian Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Parent/Guardian
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Name"
                value={enrollment.parentName}
              />
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={enrollment.parentEmail}
                copyable
              />
              {enrollment.parentPhone && (
                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={enrollment.parentPhone}
                  copyable
                />
              )}
              {enrollment.employer && (
                <InfoItem
                  icon={<Building2 className="h-4 w-4" />}
                  label="Employer"
                  value={enrollment.employer}
                />
              )}
            </div>
          </div>

          {/* Camp Schedule */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Camp Schedule
            </h3>
            <div className="space-y-2">
              {enrollment.campDates.map((campDate, index) => {
                // Safely parse date
                let dateDisplay = 'Invalid date';
                try {
                  const dateValue = typeof campDate === 'string' ? campDate : campDate.date;
                  if (dateValue) {
                    dateDisplay = format(new Date(dateValue), 'EEEE, MMM d, yyyy');
                  }
                } catch (e) {
                  console.error('Date parsing error:', e, campDate);
                }

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <Calendar className="h-4 w-4 text-primary" />
                        {dateDisplay}
                      </div>
                      {typeof campDate === 'object' && campDate.startTime && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {campDate.startTime} - {campDate.endTime}
                        </div>
                      )}
                    </div>
                    {typeof campDate === 'object' && campDate.hours && (
                      <div className="text-sm font-semibold text-primary">
                        {campDate.hours}h
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Location & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrollment.location && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Location
                </h3>
                <div className="flex items-start gap-2 p-4 rounded-lg border bg-card">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-sm">{enrollment.location}</span>
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Summary
              </h3>
              <div className="space-y-2">
                {enrollment.children && enrollment.children.length > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <span className="text-sm text-muted-foreground">Children</span>
                    <span className="text-sm font-semibold">
                      {enrollment.children.length}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                  <span className="text-sm text-muted-foreground">Total Days</span>
                  <span className="text-sm font-semibold">
                    {enrollment.campDates.length}
                  </span>
                </div>
                {enrollment.totalCost && (
                  <div className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    isEnrolled ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                  )}>
                    <span className="text-sm font-medium">
                      {isEnrolled ? 'Revenue' : 'Lost Revenue'}
                    </span>
                    <span className={cn(
                      "text-sm font-bold",
                      isEnrolled ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    )}>
                      ${enrollment.totalCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  copyable?: boolean;
}

function InfoItem({ icon, label, value, copyable }: InfoItemProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
      <div className="text-primary mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:text-foreground transition-colors"
          title="Copy to clipboard"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
          </svg>
        </button>
      )}
    </div>
  );
}

