import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { registrationAPI } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

export function useRegistrations(params?: any) {
  return useQuery({
    queryKey: ['registrations', params],
    queryFn: () => registrationAPI.getAll(params),
  });
}

export function useRegistration(id: string) {
  return useQuery({
    queryKey: ['registration', id],
    queryFn: () => registrationAPI.getById(id),
    enabled: !!id,
  });
}

export function useCreateRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: registrationAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast({
        title: 'Success',
        description: 'Registration created successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to create registration',
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      registrationAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast({
        title: 'Success',
        description: 'Registration updated successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to update registration',
        variant: 'destructive',
      });
    },
  });
}

export function useDeleteRegistration() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: registrationAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['registrations'] });
      toast({
        title: 'Success',
        description: 'Registration cancelled successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.detail || 'Failed to cancel registration',
        variant: 'destructive',
      });
    },
  });
}

