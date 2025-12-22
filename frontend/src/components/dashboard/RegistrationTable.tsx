import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit, Trash2, User, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useDeleteRegistration } from '@/hooks/useRegistrations';

interface Registration {
  id: string;
  registrationId: string;
  childName: string;
  parentName: string;
  parentEmail: string;
  status: string;
  campDates: string[];
  totalCost: number;
  enrollmentDate: string;
}

interface RegistrationTableProps {
  registrations: Registration[];
  onEdit: (registration: Registration) => void;
  loading?: boolean;
}

export default function RegistrationTable({
  registrations,
  onEdit,
  loading = false,
}: RegistrationTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const deleteMutation = useDeleteRegistration();

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to cancel this registration?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </Card>
    );
  }

  if (registrations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
        <p className="text-muted-foreground">
          Start by adding a new registration or wait for emails to be processed.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {registrations.map((registration, index) => (
          <motion.div
            key={registration.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-4 hover:border-primary/50 transition-all cursor-pointer glass-effect"
              onClick={() =>
                setExpandedRow(
                  expandedRow === registration.id ? null : registration.id
                )
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-4 gap-4">
                  {/* Child & Parent Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{registration.childName}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {registration.parentName}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        registration.status === 'enrolled'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {registration.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {formatDate(registration.enrollmentDate)}
                    </span>
                  </div>

                  {/* Cost */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold">
                      {formatCurrency(registration.totalCost)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onEdit(registration)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(registration.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedRow === registration.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-white/10"
                  >
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p className="font-medium">{registration.parentEmail}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Registration ID:</span>
                        <p className="font-mono text-xs">
                          {registration.registrationId}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Camp Dates:</span>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {registration.campDates.map((date, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-primary/10 rounded text-xs"
                            >
                              {formatDate(date)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

