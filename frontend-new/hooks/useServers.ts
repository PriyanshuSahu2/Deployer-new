import {
  createServer,
  deleteServer,
  listServers,
  checkPort,
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

export const useCheckPort = (workspaceUuid: string, serverUuid: string, port: number, enabled = false) => {
  return useQuery({
    queryKey: ['portCheck', workspaceUuid, serverUuid, port],
    queryFn: () => checkPort(workspaceUuid, serverUuid, port),
    enabled: enabled && !!serverUuid && !!port,
    select: (res) => res.data.available,
    retry: false,
  });
};

export const useTestConnection = (workspaceUuid: string) => {
  return useMutation({
    mutationFn: (payload: TestConnectionPayload) =>
      testServerConnection(workspaceUuid, payload),
  });
};
