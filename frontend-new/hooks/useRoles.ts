import {
  createRole,
  deleteRole,
  getRoles,
  updateRole,
  type UpdateRolePayload,
} from '@/service/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role } from '@/types/role';

export const useGetRoles = (workspaceUuid: string, enabled = false) => {
  return useQuery({
    queryKey: ['roles', workspaceUuid],
    queryFn: () => getRoles(workspaceUuid),
    enabled: enabled,
    select: (res) => res.data,
  });
};

export const useCreateRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: Pick<Role, 'role_name' | 'description'>) =>
      createRole({ ...role, workspace_uuid: workspaceUuid }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};

export const useUpdateRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: UpdateRolePayload) => updateRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};

export const useDeleteRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleUuid: string) => deleteRole(roleUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};
