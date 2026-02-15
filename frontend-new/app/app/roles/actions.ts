'use server';

import { roleService } from '@/service/role';
import { Role } from '@/types/role';
import { cookies } from 'next/headers';

export async function createRole(role: Role) {
  const cookieStore = await cookies();
  await roleService.createRole(role, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
}

export async function updateRole(role: Role) {
  const cookieStore = await cookies();
  await roleService.updatedRole(role, {
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
}

export async function listRoles() {
  const cookieStore = await cookies();
  const roles = await roleService.listRoles({
    headers: {
      Cookie: cookieStore.toString(),
    },
  });
  return roles;
}
