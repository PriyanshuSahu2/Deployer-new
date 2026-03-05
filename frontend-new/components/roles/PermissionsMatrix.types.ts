import type { ReactNode } from 'react';

export type PermissionMap = Record<string, boolean>;

export type PermissionRow = {
  key: string;
  label: string;
  icon: ReactNode;
  permissions: PermissionMap;
};

export type BackendPermission = {
  id?: number | string;
  key?: string | null;
  module?: string | null;
  description?: string | null;
};

export type BackendRolePermission = {
  permission_id?: number | string | null;
  permissionId?: number | string | null;
  role_permission_id?: number | string | null;
  rolePermissionId?: number | string | null;
  module?: string | null;
  permission_key?: string | null;
  permissionKey?: string | null;
  key?: string | null;
  allowed?: boolean | null;
  is_allowed?: boolean | null;
  granted?: boolean | null;
  has_permission?: boolean | null;
  value?: boolean | null;
  permission?: BackendPermission | null;
};

export type ModuleMeta = {
  label: string;
  icon: ReactNode;
  order: number;
};

export type ModuleMetaMap = Record<string, ModuleMeta>;
