import {
  createRole,
  deleteRole,
  listRoles,
  updateRole,
  type UpdateRolePayload,
} from '@/service/role';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Role } from '@/types/role';

export const useGetProjects = (workspaceUuid: string, enabled = false) => {
  return useQuery({
    queryKey: ['projects', workspaceUuid],
    queryFn: () => listProjects(workspaceUuid),
    enabled,
    select: (res) => res.data,
  });
};

export const useCreateProject = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: Pick<Role, 'role_name' | 'description'>) =>
      createRole(workspaceUuid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};

export const useUpdateProject = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (role: UpdateRolePayload) =>
      updateRole(workspaceUuid, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};

export const useDeleteProject = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleUuid: string) =>
      deleteRole(workspaceUuid, roleUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};