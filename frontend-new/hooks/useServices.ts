import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createService } from '@/service/service';
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
