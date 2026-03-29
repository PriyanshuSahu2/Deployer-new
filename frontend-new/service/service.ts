import { privateRequest } from '@/lib/requestMethod';
import type { CreateServicePayload, Service } from '@/types/service';

export const createService = (workspaceUUID: string, projectUUID: string, payload: CreateServicePayload) => {
  return privateRequest.post<Service>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services`, payload);
};

export const getServices = (workspaceUUID: string, projectUUID: string) => {
  return privateRequest.get<Service[]>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services`);
};

export const getServiceDetails = (workspaceUUID: string, projectUUID: string, serviceUUID: string) => {
  return privateRequest.get<Service>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services/${serviceUUID}`);
};

export const triggerDeployment = (workspaceUUID: string, projectUUID: string, serviceUUID: string) => {
  return privateRequest.post<{ message: string }>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services/${serviceUUID}/trigger-deploy`);
};

export const getServiceLogs = (workspaceUUID: string, projectUUID: string, serviceUUID: string) => {
  return privateRequest.get<{ logs: string }>(`/workspaces/${workspaceUUID}/projects/${projectUUID}/services/${serviceUUID}/logs`);
};

export const toggleAutoDeploy = (workspaceUUID: string, projectUUID: string, serviceUUID: string, enabled: boolean) => {
  return privateRequest.patch<{ message: string; enabled: boolean }>(
    `/workspaces/${workspaceUUID}/projects/${projectUUID}/services/${serviceUUID}/auto-deploy`,
    { enabled }
  );
};
