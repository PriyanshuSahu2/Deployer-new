import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
  type UpdateRolePayload,
} from '@/service/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role } from '@/types/role';

export const useGetRoles = (workspaceUuid: string, enabled = false) => {
  return useQuery({
    queryKey: ['roles', workspaceUuid],
    queryFn: () => listRoles(workspaceUuid),
    enabled,
    select: (res) => res.data,
  });
};

export const useCreateRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Pick<Role, 'role_name' | 'description'>) =>
      createRole(workspaceUuid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};

export const useUpdateRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: UpdateRolePayload) =>
      updateRole(workspaceUuid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};

export const useDeleteRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleUuid: string) =>
      deleteRole(workspaceUuid, roleUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};