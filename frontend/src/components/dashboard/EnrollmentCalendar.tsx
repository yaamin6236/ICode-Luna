import { useState } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Registration {
  _id: string;
  childName: string;
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
  careRequestNumber?: string;
}

interface EnrollmentCalendarProps {
  registrations: Registration[];
  onDateClick: (date: Date, enrollments: Registration[]) => void;
  selectedDate?: Date | null;
}

export function EnrollmentCalendar({ registrations, onDateClick, selectedDate }: EnrollmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get all registrations for a specific date (for passing to onClick)
  const getRegistrationsForDate = (date: Date) => {
    return registrations.filter(reg => {
      if (!reg.campDates || reg.campDates.length === 0) return false;
      
      return reg.campDates.some((campDate: any) => {
        try {
          // campDate can be either a string or an object with a date property
          const dateStr = typeof campDate === 'string' ? campDate : (campDate.date || campDate);
          if (!dateStr) return false;
          return isSameDay(new Date(dateStr as string), date);
        } catch (e) {
          console.error('Error parsing camp date:', campDate, e);
          return false;
        }
      });
    });
  };

  // Get ONLY enrolled (non-cancelled) enrollments for display count
  const getEnrolledCountForDate = (date: Date) => {
    const regs = getRegistrationsForDate(date);
    return regs.filter(reg => reg.status === 'enrolled').length;
  };

  // Get the first day of week offset
  const firstDayOfWeek = monthStart.getDay();

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card className="p-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarIcon className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-display font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-10 w-10 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-10 w-10 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-3">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-xs font-display font-semibold uppercase tracking-wider text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map((date, index) => {
            const allRegistrations = getRegistrationsForDate(date);
            const enrolledCount = getEnrolledCountForDate(date);
            const hasRegistrations = allRegistrations.length > 0;
            const isToday = isSameDay(date, new Date());
            const isSelected = selectedDate && isSameDay(date, selectedDate);

            return (
              <motion.button
                key={date.toISOString()}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: index * 0.01 }}
                onClick={() => hasRegistrations && onDateClick(date, allRegistrations)}
                whileHover={hasRegistrations ? { scale: 1.05, y: -2 } : {}}
                whileTap={hasRegistrations ? { scale: 0.95 } : {}}
                className={cn(
                  "aspect-square p-3 rounded-2xl transition-all duration-200 relative group",
                  "flex flex-col items-center justify-center shadow-organic-sm",
                  hasRegistrations
                    ? "bg-secondary/10 border-2 border-secondary/30 hover:border-secondary hover:shadow-organic cursor-pointer"
                    : "bg-muted/30 border-2 border-transparent hover:border-border/50",
                  isToday && !isSelected && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background",
                  isSelected && "bg-primary/20 border-primary ring-2 ring-primary ring-offset-2 ring-offset-background shadow-glow-warm"
                )}
                disabled={!hasRegistrations}
              >
                <span className={cn(
                  "text-sm font-display font-medium mb-1",
                  isToday && !isSelected && "text-primary font-bold",
                  isSelected && "text-primary font-bold",
                  hasRegistrations && !isToday && !isSelected && "text-secondary font-semibold"
                )}>
                  {format(date, 'd')}
                </span>
                {enrolledCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.01 + 0.1, type: "spring" }}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary/20"
                  >
                    <Users className="h-3 w-3 text-secondary" />
                    <span className="text-xs font-bold text-secondary tabular-nums">
                      {enrolledCount}
                    </span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 rounded-full bg-secondary shadow-organic-sm" />
            <span className="text-sm text-muted-foreground">Has Enrollments</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="h-4 w-4 rounded-full ring-2 ring-primary shadow-glow-warm-sm" />
            <span className="text-sm text-muted-foreground">Today</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
