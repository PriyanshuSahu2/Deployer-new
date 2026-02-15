//service/role.ts

import { apiFetch } from '@/lib/api';
import { Role } from '@/types/role';

export const roleService = {
  async createRole(role: Role, options?: RequestInit) {
    await apiFetch(`/api/roles`, {
      method: 'POST',
      body: role,
      ...options,
    });
  },
  async updatedRole(role: Role, options?: RequestInit) {
    await apiFetch(`/api/roles`, {
      method: 'PUT',
      body: role,
      ...options,
    });
  },
  async listRoles(options?: RequestInit) {
    const response = await apiFetch(`/api/roles`, {
      method: 'GET',
      ...options,
    });
    return response;
  },
};
