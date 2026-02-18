import { privateRequest } from '@/lib/requestMethod';
import { Role } from '@/types/role';
import { Axios } from 'axios';

export const createRole = (role: Role) =>
  privateRequest.post('/roles', role);

export const updateRole = (role: Role) =>
  privateRequest.put(`/roles/${role.uuid}`, role);


export const listRoles = () =>
  privateRequest.get<Role[]>('/roles/');

export const getRoles = (workspaceId: string) =>
  privateRequest.get<Role[]>(`/roles/${workspaceId}`);