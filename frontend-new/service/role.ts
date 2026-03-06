import { privateRequest } from '@/lib/requestMethod';
import { Role } from '@/types/role';

export type CreateRolePayload = Pick<Role, 'role_name' | 'description'>;

export type UpdateRolePayload = Pick<Role, 'uuid' | 'role_name' | 'description'>;

export const createRole = (workspaceUUID: string, role: CreateRolePayload) =>
  privateRequest.post(`/workspaces/${workspaceUUID}/roles`, role);

export const updateRole = (workspaceUUID: string, role: UpdateRolePayload) =>
  privateRequest.put(`/workspaces/${workspaceUUID}/roles/${role.uuid}`, role);

export const deleteRole = (workspaceUUID: string, roleUuid: string) =>
  privateRequest.delete(`/workspaces/${workspaceUUID}/roles/${roleUuid}`);

export const listRoles = (workspaceUUID: string) =>
  privateRequest.get<Role[]>(`/workspaces/${workspaceUUID}/roles`);