import { privateRequest } from '@/lib/requestMethod';
import {
  type CreateServerPayload,
  type Server,
  type UpdateServerPayload,
} from '@/types/server';

export const listServers = (workspaceUUID: string) =>
  privateRequest.get<Server[]>(`/workspaces/${workspaceUUID}/servers`);

export const createServer = (
  workspaceUUID: string,
  server: CreateServerPayload,
) => privateRequest.post(`/workspaces/${workspaceUUID}/servers`, server);

export const updateServer = (
  workspaceUUID: string,
  server: UpdateServerPayload,
) =>
  privateRequest.put(`/workspaces/${workspaceUUID}/servers/${server.uuid}`, server);

export const deleteServer = (workspaceUUID: string, serverUuid: string) =>
  privateRequest.delete(`/workspaces/${workspaceUUID}/servers/${serverUuid}`);
