import { privateRequest } from '@/lib/requestMethod';
import { Project } from '@/types/project';

export type CreateProjectPayload = Pick<
  Project,
  'name' | 'description' | 'framework'
>;

export type UpdateProjectPayload = Pick<
  Project,
  'uuid' | 'name' | 'description' | 'framework'
>;

export const listProjects = (workspaceUUID: string) =>
  privateRequest.get<Project[]>(`/workspaces/${workspaceUUID}/projects`);

export const createProject = (
  workspaceUUID: string,
  project: CreateProjectPayload,
) => privateRequest.post(`/workspaces/${workspaceUUID}/projects`, project);

export const updateProject = (
  workspaceUUID: string,
  project: UpdateProjectPayload,
) =>
  privateRequest.put(
    `/workspaces/${workspaceUUID}/projects/${project.uuid}`,
    project,
  );

export const deleteProject = (workspaceUUID: string, projectUuid: string) =>
  privateRequest.delete(`/workspaces/${workspaceUUID}/projects/${projectUuid}`);
