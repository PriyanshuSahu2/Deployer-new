import { createRole, getRoles, updateRole } from '@/service/role';
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
    mutationFn: (role: Omit<Role, 'uuid' | 'created_at'>) =>
      createRole(role as Role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};

export const useUpdateRole = (workspaceUuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (role: Role) => updateRole(role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles', workspaceUuid] });
    },
  });
};
