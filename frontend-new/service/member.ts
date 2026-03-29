import { privateRequest } from "@/lib/requestMethod";

export const inviteMember = (workspaceUUID: string, params: Record<string, unknown>) =>
  privateRequest.post(`/workspaces/${workspaceUUID}/invite-member`, params);

export const getWorkspaceMembers = (workspaceUUID: string) =>
  privateRequest.get(`/workspaces/${workspaceUUID}/members`);