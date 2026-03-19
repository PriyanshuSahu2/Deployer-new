import { privateRequest } from '@/lib/requestMethod';
import type { CreateServicePayload, Service } from '@/types/service';

export const createService = (workspaceUUID: string, projectUUID: string, payload: CreateServicePayload) => {
  return privateRequest.post<Service>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services`, payload);
};
