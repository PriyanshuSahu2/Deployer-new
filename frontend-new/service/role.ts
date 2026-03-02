import { privateRequest } from '@/lib/requestMethod';
import { Role } from '@/types/role';

export type CreateRolePayload = Pick<Role, 'role_name' | 'description'> & {
  workspace_uuid: string;
};

export type UpdateRolePayload = Pick<Role, 'uuid' | 'role_name' | 'description'>;

export const createRole = (role: CreateRolePayload) =>
  privateRequest.post('/roles', role);

export const updateRole = (role: UpdateRolePayload) =>
  privateRequest.put(`/roles/${role.uuid}`, role);

export const deleteRole = (roleUuid: string) =>
  privateRequest.delete(`/roles/${roleUuid}`);

export const listRoles = () => privateRequest.get<Role[]>('/roles/');

export const getRoles = (workspaceId: string) =>
  privateRequest.get<Role[]>(`/roles/${workspaceId}`);
