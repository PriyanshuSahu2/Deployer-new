import {
  createServer,
  deleteServer,
  listServers,
  testServerConnection,
  updateServer,
} from '@/service/server';
import {
  type CreateServerPayload,
  type TestConnectionPayload,
  type UpdateServerPayload,
} from '@/types/server';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetServers = (workspaceUuid: string, enabled = false) => {
  return useQuery({
    queryKey: ['servers', workspaceUuid],
    queryFn: () => listServers(workspaceUuid),
    enabled,
    select: (res) => res.data,
  });
};

export const useCreateServer = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (server: CreateServerPayload) => createServer(workspaceUuid, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers', workspaceUuid] });
    },
  });
};

export const useUpdateServer = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (server: UpdateServerPayload) => updateServer(workspaceUuid, server),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers', workspaceUuid] });
    },
  });
};

export const useDeleteServer = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serverUuid: string) => deleteServer(workspaceUuid, serverUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servers', workspaceUuid] });
    },
  });
};

export const useTestConnection = (workspaceUuid: string) => {
  return useMutation({
    mutationFn: (payload: TestConnectionPayload) =>
      testServerConnection(workspaceUuid, payload),
  });
};
