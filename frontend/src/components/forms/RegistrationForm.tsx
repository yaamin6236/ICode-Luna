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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Child Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Child Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="childName">Child Name *</Label>
                <Input
                  id="childName"
                  name="childName"
                  value={formData.childName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="childAge">Age</Label>
                <Input
                  id="childAge"
                  name="childAge"
                  type="number"
                  value={formData.childAge}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Parent Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Parent Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="parentName">Parent Name *</Label>
                <Input
                  id="parentName"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Email *</Label>
                <Input
                  id="parentEmail"
                  name="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="parentPhone">Phone</Label>
              <Input
                id="parentPhone"
                name="parentPhone"
                type="tel"
                value={formData.parentPhone}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Camp Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Camp Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campType">Camp Type</Label>
                <Input
                  id="campType"
                  name="campType"
                  value={formData.campType}
                  onChange={handleChange}
                  placeholder="e.g., Summer Camp"
                />
              </div>
              <div>
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
            <h3 className="text-sm font-semibold text-primary">Financial Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="totalCost">Total Cost</Label>
                <Input
                  id="totalCost"
                  name="totalCost"
                  type="number"
                  step="0.01"
                  value={formData.totalCost}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="amountPaid">Amount Paid</Label>
                <Input
                  id="amountPaid"
                  name="amountPaid"
                  type="number"
                  step="0.01"
                  value={formData.amountPaid}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Status */}
          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="enrolled">Enrolled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="gradient-primary"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Saving...'
                : isEdit
                ? 'Update'
                : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

