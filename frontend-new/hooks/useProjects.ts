import {
  createProject,
  deleteProject,
  getProjectDetails,
  listProjects,
  updateProject,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from '@/service/project';
import { Project } from '@/types/project';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

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
    mutationFn: (project: CreateProjectPayload) =>
      createProject(workspaceUuid, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};

export const useUpdateProject = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (project: UpdateProjectPayload) =>
      updateProject(workspaceUuid, project),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};

export const useDeleteProject = (workspaceUuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectUuid: string) => deleteProject(workspaceUuid, projectUuid),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', workspaceUuid] });
    },
  });
};


export const useGetProjectDetails = (workspaceUuid: string, projectUuid: string, enabled = false) => {
  return useQuery({
    queryKey: ['projects', workspaceUuid, projectUuid],
    queryFn: () => getProjectDetails(workspaceUuid, projectUuid),
    enabled: enabled && !!workspaceUuid && !!projectUuid,
    select: (res) => res.data as Project,
  });
};