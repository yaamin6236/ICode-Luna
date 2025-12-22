import { useState } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
}

export function EnrollmentCalendar({ registrations, onDateClick }: EnrollmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get enrollments for a specific date
  const getEnrollmentsForDate = (date: Date) => {
    return registrations.filter(reg => 
      reg.status === 'enrolled' && 
      reg.campDates.some(campDate => 
        isSameDay(new Date(campDate.date), date)
      )
    );
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
    <Card className="p-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {/* Empty cells for offset */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map(date => {
            const enrollments = getEnrollmentsForDate(date);
            const hasEnrollments = enrollments.length > 0;
            const isToday = isSameDay(date, new Date());

            return (
              <button
                key={date.toISOString()}
                onClick={() => hasEnrollments && onDateClick(date, enrollments)}
                className={cn(
                  "aspect-square p-2 rounded-lg border-2 transition-all relative group",
                  "flex flex-col items-center justify-center",
                  hasEnrollments
                    ? "border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary cursor-pointer"
                    : "border-transparent hover:border-border",
                  isToday && "ring-2 ring-primary ring-offset-2"
                )}
                disabled={!hasEnrollments}
              >
                <span className={cn(
                  "text-sm font-medium",
                  isToday && "text-primary font-bold"
                )}>
                  {format(date, 'd')}
                </span>
                {hasEnrollments && (
                  <div className="flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3 text-primary" />
                    <span className="text-xs font-semibold text-primary">
                      {enrollments.length}
                    </span>
                  </div>
                )}
                {hasEnrollments && (
                  <div className="absolute inset-0 rounded-lg bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span>Has Enrollments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full ring-2 ring-primary" />
            <span>Today</span>
          </div>
        </div>
      </div>
    </Card>
  );
}

