import { motion } from 'framer-motion';
import { Calendar, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';

interface CapacityData {
  date: string;
  count: number;
  registrations: Array<{
    childName: string;
    parentName: string;
    campType: string;
  }>;
}

interface DailyCapacityViewProps {
  data: CapacityData[];
  loading?: boolean;
}

export default function DailyCapacityView({
  data,
  loading = false,
}: DailyCapacityViewProps) {
  if (loading) {
    return (
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Daily Capacity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-muted animate-pulse rounded"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card className="glass-effect">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Daily Enrollment Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {data.slice(0, 35).map((day, index) => {
            const intensity = day.count / maxCount;
            const bgOpacity = Math.max(0.1, intensity);

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02 }}
                className="group relative"
              >
                <div
                  className="aspect-square rounded-lg border border-white/10 flex flex-col items-center justify-center p-2 cursor-pointer hover:scale-105 transition-transform"
                  style={{
                    backgroundColor: `hsla(263, 70%, 50%, ${bgOpacity})`,
                  }}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {new Date(day.date).getDate()}
                  </div>
                  {day.count > 0 && (
                    <div className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span className="text-sm font-bold">{day.count}</span>
                    </div>
                  )}
                </div>

                {/* Tooltip */}
                {day.count > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                    <div className="glass-effect p-3 rounded-lg border border-white/20 shadow-lg min-w-48">
                      <div className="text-sm font-semibold mb-2">
                        {formatDate(day.date)}
                      </div>
                      <div className="text-xs text-muted-foreground mb-2">
                        {day.count} enrollment{day.count !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {day.registrations.slice(0, 5).map((reg, i) => (
                          <div
                            key={i}
                            className="text-xs py-1 border-t border-white/10"
                          >
                            <div className="font-medium">{reg.childName}</div>
                            <div className="text-muted-foreground">
                              {reg.campType || 'Camp'}
                            </div>
                          </div>
                        ))}
                        {day.registrations.length > 5 && (
                          <div className="text-xs text-muted-foreground pt-1">
                            +{day.registrations.length - 5} more...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/10 border border-white/10" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/50 border border-white/10" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary border border-white/10" />
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

