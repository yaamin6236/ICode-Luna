import { format } from 'date-fns';
import {
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
  Copy,
  Check,
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface Registration {
  _id: string;
  childName: string;
  children?: string[];
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
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-3xl font-display font-bold tracking-tight">
            {enrollment.children && enrollment.children.length > 1
              ? `${enrollment.children.length} Children`
              : enrollment.childName}
          </DialogTitle>
          <DialogDescription>
            Registration details for {isEnrolled ? 'enrolled' : 'cancelled'} student
            {enrollment.registrationId && ` - ${enrollment.registrationId}`}
          </DialogDescription>
        </DialogHeader>

        {/* Status badges below header */}
        <div className="flex items-center gap-3 -mt-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium font-display border-2',
              isEnrolled
                ? 'bg-secondary/15 text-secondary border-secondary/30'
                : 'bg-destructive/15 text-destructive border-destructive/30'
            )}
          >
            {isEnrolled ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <XCircle className="h-3.5 w-3.5" />
            )}
            {isEnrolled ? 'Enrolled' : 'Cancelled'}
          </span>
          {enrollment.registrationId && (
            <span className="text-sm text-muted-foreground font-mono flex items-center gap-1">
              <Hash className="h-3 w-3" />
              {enrollment.registrationId}
            </span>
          )}
        </div>

        <div className="space-y-8">

          {/* Children Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-primary/10 rounded-xl">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider">
                {enrollment.children && enrollment.children.length > 1 ? 'Students' : 'Student Information'}
              </h3>
            </div>
            {enrollment.children && enrollment.children.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {enrollment.children.map((child, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-4 rounded-2xl bg-muted/30 border-2 border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <User className="h-3.5 w-3.5 text-primary" />
                      </div>
                      <span className="font-medium font-display">{child}</span>
                    </div>
                  </motion.div>
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
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-secondary/10 rounded-xl">
                <User className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider">
                Parent/Guardian
              </h3>
            </div>
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
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-accent/10 rounded-xl">
                <Calendar className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-sm font-display font-semibold uppercase tracking-wider">
                Camp Schedule
              </h3>
            </div>
            <div className="space-y-3">
              {enrollment.campDates.map((campDate, index) => {
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-5 rounded-2xl bg-muted/20 border-2 border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2.5 text-sm font-medium font-display">
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
                      <div className="text-sm font-bold font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                        {campDate.hours}h
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Location & Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollment.location && (
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-primary/10 rounded-lg">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                    Location
                  </h3>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/20 border-2 border-border/50">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{enrollment.location}</span>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <h3 className="text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground">
                Summary
              </h3>
              <div className="space-y-2">
                {enrollment.children && enrollment.children.length > 0 && (
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border-2 border-border/50">
                    <span className="text-sm text-muted-foreground font-display">Children</span>
                    <span className="text-sm font-bold font-mono tabular-nums">
                      {enrollment.children.length}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/20 border-2 border-border/50">
                  <span className="text-sm text-muted-foreground font-display">Total Days</span>
                  <span className="text-sm font-bold font-mono tabular-nums">
                    {enrollment.campDates.length}
                  </span>
                </div>
                {enrollment.totalCost && (
                  <div className={cn(
                    "flex items-center justify-between p-4 rounded-2xl border-2",
                    isEnrolled 
                      ? "bg-secondary/10 border-secondary/30" 
                      : "bg-destructive/10 border-destructive/30"
                  )}>
                    <span className="text-sm font-medium font-display">
                      {isEnrolled ? 'Revenue' : 'Lost Revenue'}
                    </span>
                    <span className={cn(
                      "text-lg font-bold font-mono tabular-nums",
                      isEnrolled ? "text-secondary" : "text-destructive"
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/20 border-2 border-border/50 hover:border-primary/30 transition-all group">
      <div className="text-primary mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground mb-1.5 font-display uppercase tracking-wider">{label}</div>
        <div className="text-sm font-medium truncate">{value}</div>
      </div>
      {copyable && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleCopy}
          className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-lg hover:bg-primary/10"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-secondary" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </motion.button>
      )}
    </div>
  );
}
