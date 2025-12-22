import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useCreateRegistration, useUpdateRegistration } from '@/hooks/useRegistrations';
import { User, Users, CalendarDays, DollarSign } from 'lucide-react';

interface RegistrationFormProps {
  open: boolean;
  onClose: () => void;
  registration?: any;
}

export default function RegistrationForm({
  open,
  onClose,
  registration,
}: RegistrationFormProps) {
  const isEdit = !!registration;
  const createMutation = useCreateRegistration();
  const updateMutation = useUpdateRegistration();

  const [formData, setFormData] = useState({
    childName: registration?.childName || '',
    childAge: registration?.childAge || '',
    parentName: registration?.parentName || '',
    parentEmail: registration?.parentEmail || '',
    parentPhone: registration?.parentPhone || '',
    campType: registration?.campType || '',
    campDates: registration?.campDates?.[0]?.split('T')[0] || '',
    totalCost: registration?.totalCost || '',
    amountPaid: registration?.amountPaid || '',
    status: registration?.status || 'enrolled',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      childName: formData.childName,
      childAge: formData.childAge ? parseInt(formData.childAge) : null,
      parentName: formData.parentName,
      parentEmail: formData.parentEmail,
      parentPhone: formData.parentPhone,
      campType: formData.campType,
      campDates: [new Date(formData.campDates).toISOString()],
      totalCost: formData.totalCost ? parseFloat(formData.totalCost) : null,
      amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : null,
      status: formData.status,
      enrollmentDate: new Date().toISOString(),
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          id: registration.id,
          data: payload,
        });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Edit Registration' : 'New Registration'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update registration details below'
              : 'Manually add a new camp registration'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Child Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-primary/10 rounded-lg">
                <User className="w-4 h-4 text-primary" />
              </div>
              <h3 className="text-sm font-display font-semibold">Child Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childName">Child Name *</Label>
                <Input
                  id="childName"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                  placeholder="Enter child's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="childAge">Age</Label>
                <Input
                  id="childAge"
                  name="childAge"
                  type="number"
                  value={formData.childAge}
                  onChange={handleChange}
                  placeholder="8"
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-secondary/10 rounded-lg">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <h3 className="text-sm font-display font-semibold">Parent Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="parentName">Parent Name *</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                  placeholder="Enter parent's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                  placeholder="parent@example.com"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentPhone">Phone</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          {/* Camp Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-accent/10 rounded-lg">
                <CalendarDays className="w-4 h-4 text-accent" />
              </div>
              <h3 className="text-sm font-display font-semibold">Camp Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campType">Camp Type</Label>
                <Input
                  id="campType"
                  name="campType"
                  value={formData.campType}
                  onChange={handleChange}
                  placeholder="e.g., Summer Coding Camp"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="campDates">Camp Date *</Label>
                <Input
                  id="campDates"
                  name="campDates"
                  type="date"
                  value={formData.campDates}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-1.5 bg-success/10 rounded-lg">
                <DollarSign className="w-4 h-4 text-success" />
              </div>
              <h3 className="text-sm font-display font-semibold">Financial Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  name="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="font-mono"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="w-full h-11 px-4 rounded-[10px] border-2 border-input bg-background text-sm font-display transition-all duration-300 focus:outline-none focus:border-primary/50 focus:shadow-glow-warm-sm hover:border-primary/30"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="enrolled">Enrolled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose} size="lg">
              Cancel
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                ? 'Update Registration'
                : 'Create Registration'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
