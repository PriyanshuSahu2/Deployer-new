import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createService, getServices, triggerDeployment, getServiceLogs, toggleAutoDeploy, getServiceDetails } from '@/service/service';
import type { CreateServicePayload } from '@/types/service';

export const useCreateService = (workspaceUUID: string, projectUUID: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateServicePayload) => createService(workspaceUUID, projectUUID, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services', projectUUID] });
    },
  });
};

export const useGetServices = (workspaceUUID: string, projectUUID: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['services', projectUUID],
    queryFn: () => getServices(workspaceUUID, projectUUID),
    enabled: !!workspaceUUID && !!projectUUID && enabled,
  });
};

export const useTriggerDeployment = (workspaceUUID: string, projectUUID: string) => {
  return useMutation({
    mutationFn: (serviceUUID: string) => triggerDeployment(workspaceUUID, projectUUID, serviceUUID),
  });
};

export const useGetServiceLogs = (workspaceUUID: string, projectUUID: string, serviceUUID: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['serviceLogs', serviceUUID],
    queryFn: () => getServiceLogs(workspaceUUID, projectUUID, serviceUUID),
    enabled: !!workspaceUUID && !!projectUUID && !!serviceUUID && enabled,
    refetchInterval: 3000,
  });
};

export const useToggleAutoDeploy = (workspaceUUID: string, projectUUID: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ serviceUUID, enabled }: { serviceUUID: string; enabled: boolean }) =>
      toggleAutoDeploy(workspaceUUID, projectUUID, serviceUUID, enabled),
    onSuccess: (_, { serviceUUID }) => {
      queryClient.invalidateQueries({ queryKey: ['serviceDetails', serviceUUID] });
      queryClient.invalidateQueries({ queryKey: ['services', projectUUID] });
    },
  });
};

export const useGetServiceDetails = (workspaceUUID: string, projectUUID: string, serviceUUID: string) => {
  return useQuery({
    queryKey: ['serviceDetails', serviceUUID],
    queryFn: () => getServiceDetails(workspaceUUID, projectUUID, serviceUUID),
    enabled: !!workspaceUUID && !!projectUUID && !!serviceUUID,
  });
};
