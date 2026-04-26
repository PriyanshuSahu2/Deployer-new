import { privateRequest } from "@/lib/requestMethod";
import type {
  CreatedWorkspaceAPIKey,
  UpdateWorkspaceSettingsPayload,
  WorkspaceSettings,
} from "@/types/workspace-settings";

export const getUserWorkspace = () =>
  privateRequest.get("/workspaces");

export const createWorkspace = (name: string) =>
  privateRequest.post("/workspaces", { name });

export const getWorkspaceSettings = (workspaceUUID: string) =>
  privateRequest.get<WorkspaceSettings>(`/workspaces/${workspaceUUID}/settings`);

export const updateWorkspaceSettings = (
  workspaceUUID: string,
  payload: UpdateWorkspaceSettingsPayload,
) => privateRequest.put(`/workspaces/${workspaceUUID}/settings`, payload);

export const createWorkspaceAPIKey = (workspaceUUID: string, name: string) =>
  privateRequest.post<CreatedWorkspaceAPIKey>(
    `/workspaces/${workspaceUUID}/settings/api-keys`,
    { name },
  );

export const revokeWorkspaceAPIKey = (workspaceUUID: string, keyUUID: string) =>
  privateRequest.delete(`/workspaces/${workspaceUUID}/settings/api-keys/${keyUUID}`);

export const transferWorkspaceOwnership = (
  workspaceUUID: string,
  newOwnerId: string,
) =>
  privateRequest.post(`/workspaces/${workspaceUUID}/transfer-ownership`, {
    newOwnerId,
  });
