import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createService, getServices, deployService } from '@/service/service';
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

export const useDeployService = (workspaceUUID: string, projectUUID: string) => {
  return useMutation({
    mutationFn: (serviceUUID: string) => deployService(workspaceUUID, projectUUID, serviceUUID),
  });
};
