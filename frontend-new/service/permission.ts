import { privateRequest } from '@/lib/requestMethod';

export interface UpdateRolePermissionsPayload {
  role_uuid: string;
  permission_ids: number[];
}

export const getRolePermissions = (
  workspaceUUID: string,
  roleUUID: string
) =>
  privateRequest.get(
    `/workspaces/${workspaceUUID}/roles/${roleUUID}/permissions`
  );

export const updateRolePermissions = (
  workspaceUUID: string,
  roleUUID: string,
  payload: UpdateRolePermissionsPayload
) =>
  privateRequest.put(
    `/workspaces/${workspaceUUID}/roles/${roleUUID}/permissions`,
    payload
  );