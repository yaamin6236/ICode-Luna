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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            Daily Enrollment Capacity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {Array.from({ length: 21 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-shimmer rounded-2xl"
                style={{ animationDelay: `${i * 30}ms` }}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Calendar className="w-5 h-5 text-primary" />
          </div>
          Daily Enrollment Capacity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-3">
          {data.slice(0, 35).map((day, index) => {
            const intensity = day.count / maxCount;
            const bgOpacity = Math.max(0.05, intensity * 0.4);

            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.02, type: "spring", stiffness: 200 }}
                className="group relative"
              >
                <motion.div
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="aspect-square rounded-2xl border-2 flex flex-col items-center justify-center p-2 cursor-pointer transition-all shadow-organic-sm hover:shadow-organic"
                  style={{
                    backgroundColor: `hsla(13, 62%, 60%, ${bgOpacity})`,
                    borderColor: day.count > 0 ? `hsla(13, 62%, 60%, ${intensity * 0.5})` : 'hsl(var(--border))',
                  }}
                >
                  <div className="text-xs font-display font-medium text-muted-foreground mb-1">
                    {new Date(day.date).getDate()}
                  </div>
                  {day.count > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/15">
                      <Users className="w-3 h-3 text-primary" />
                      <span className="text-xs font-bold font-mono text-primary tabular-nums">{day.count}</span>
                    </div>
                  )}
                </motion.div>

                {/* Tooltip */}
                {day.count > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 pointer-events-none">
                    <motion.div
                      initial={{ scale: 0.9, y: 5 }}
                      whileHover={{ scale: 1, y: 0 }}
                      className="bg-card p-4 rounded-2xl shadow-organic-xl border-0 texture-paper min-w-[200px]"
                    >
                      <div className="text-sm font-display font-semibold mb-2">
                        {formatDate(day.date)}
                      </div>
                      <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Users className="w-3 h-3" />
                        {day.count} enrollment{day.count !== 1 ? 's' : ''}
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {day.registrations.slice(0, 5).map((reg, i) => (
                          <div
                            key={i}
                            className="text-xs py-2 border-t border-border/30"
                          >
                            <div className="font-medium font-display">{reg.childName}</div>
                            <div className="text-muted-foreground text-[10px] mt-0.5">
                              {reg.campType || 'Camp'}
                            </div>
                          </div>
                        ))}
                        {day.registrations.length > 5 && (
                          <div className="text-xs text-muted-foreground pt-2 font-medium">
                            +{day.registrations.length - 5} more...
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-primary/10 border-2 border-primary/20 shadow-organic-sm" />
            <span className="font-display">Low</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-primary/25 border-2 border-primary/30 shadow-organic-sm" />
            <span className="font-display">Medium</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-lg bg-primary/40 border-2 border-primary/50 shadow-organic-sm" />
            <span className="font-display">High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
