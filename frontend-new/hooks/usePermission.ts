import {
  getRolePermissions,
  updateRolePermissions,
} from '@/service/permission';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useRolePermissions = (
  workspaceUUID: string,
  roleUUID: string,
  enabled = true
) => {
  return useQuery({
    queryKey: ['role-permissions', workspaceUUID, roleUUID],
    queryFn: () => getRolePermissions(workspaceUUID, roleUUID),
    enabled: Boolean(workspaceUUID && roleUUID && enabled),
    select: (res) => res.data,
  });
};

export const useUpdateRolePermissions = (
  workspaceUUID: string,
  roleUUID: string
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (permissionIds: number[]) =>
      updateRolePermissions(workspaceUUID, roleUUID, {
        role_uuid: roleUUID,
        permission_ids: permissionIds,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['role-permissions', workspaceUUID, roleUUID],
      });
    },
  });
};