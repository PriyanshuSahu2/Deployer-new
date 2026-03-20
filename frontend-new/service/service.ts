import { privateRequest } from '@/lib/requestMethod';
import type { CreateServicePayload, Service } from '@/types/service';

export const createService = (workspaceUUID: string, projectUUID: string, payload: CreateServicePayload) => {
  return privateRequest.post<Service>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services`, payload);
};

export const getServices = (workspaceUUID: string, projectUUID: string) => {
  return privateRequest.get<Service[]>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services`);
};

export const deployService = (workspaceUUID: string, projectUUID: string, serviceUUID: string) => {
  return privateRequest.post<{ message: string }>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services/${serviceUUID}/deploy`);
};
