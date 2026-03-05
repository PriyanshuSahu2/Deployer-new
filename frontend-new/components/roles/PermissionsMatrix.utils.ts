import { privateRequest } from '@/lib/requestMethod';
import type {
  BackendRolePermission,
  ModuleMetaMap,
  PermissionRow,
} from './PermissionsMatrix.types';

const COMMON_ACTIONS = [
  'create',
  'read',
  'update',
  'delete',
  'view',
  'list',
  'manage',
  'export',
  'import',
  'approve',
  'reject',
  'assign',
] as const;

export const formatActionLabel = (action: string) =>
  action
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getActionColumns = (rows: PermissionRow[]) => {
  const actions: string[] = [];
  const seen = new Set<string>();

  for (const row of rows) {
    for (const action of Object.keys(row.permissions)) {
      if (seen.has(action)) continue;
      seen.add(action);
      actions.push(action);
    }
  }

  return actions;
};

export const toArray = <T,>(value: unknown): T[] => {
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === 'object') {
    const maybe = value as { data?: unknown; rows?: unknown; result?: unknown };
    if (Array.isArray(maybe.data)) return maybe.data as T[];
    if (Array.isArray(maybe.rows)) return maybe.rows as T[];
    if (Array.isArray(maybe.result)) return maybe.result as T[];
  }
  return [];
};

export const normalizeModuleKey = (raw?: string | null) => {
  if (!raw) return '';

  const value = raw.toLowerCase().replace(/[\s_-]/g, '');
  if (value === 'projects') return 'project';
  if (value === 'deployments') return 'deployment';
  if (value === 'members') return 'member';
  if (value === 'roles') return 'role';
  if (value === 'integrations') return 'integration';
  if (value === 'servers' || value === 'infra') return 'server';
  if (value === 'domains') return 'domain';
  if (value === 'logs' || value === 'audit') return 'log';
  if (value === 'workspaces' || value === 'settings') return 'workspace';
  return value.endsWith('s') ? value.slice(0, -1) : value;
};

export const parsePermissionKey = (key: string) => {
  const normalizedKey = key.trim().toLowerCase();
  if (!normalizedKey) return { moduleKey: '', actionKey: '' };

  if (normalizedKey.includes(':')) {
    const [moduleRaw, actionRaw] = normalizedKey.split(':');
    return {
      moduleKey: normalizeModuleKey(moduleRaw),
      actionKey: actionRaw.replace(/[^a-z0-9_-]/g, ''),
    };
  }

  for (const action of COMMON_ACTIONS) {
    if (!normalizedKey.endsWith(action)) continue;
    const moduleRaw = normalizedKey.slice(0, -action.length);
    return {
      moduleKey: normalizeModuleKey(moduleRaw),
      actionKey: action,
    };
  }

  const dotParts = normalizedKey.split('.');
  if (dotParts.length === 2) {
    return {
      moduleKey: normalizeModuleKey(dotParts[0]),
      actionKey: dotParts[1].replace(/[^a-z0-9_-]/g, ''),
    };
  }

  return { moduleKey: normalizeModuleKey(normalizedKey), actionKey: 'read' };
};

export const getExplicitRolePermissionValue = (item: BackendRolePermission) => {
  const boolFields = [
    item.allowed,
    item.is_allowed,
    item.granted,
    item.has_permission,
    item.value,
  ];

  for (const field of boolFields) {
    if (typeof field === 'boolean') return field;
  }

  const nullableJoinFields = [item.role_permission_id, item.rolePermissionId];
  for (const field of nullableJoinFields) {
    if (field === null) return false;
    if (field !== undefined) return true;
  }

  return undefined;
};

export const toPermissionId = (id: number | string | undefined | null) => {
  if (id === null || id === undefined) return null;
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : null;
};

export const getRolePermissionId = (item: BackendRolePermission) =>
  toPermissionId(item.permission_id ?? item.permissionId ?? item.permission?.id);

export const getRolePermissionKey = (item: BackendRolePermission) =>
  typeof item.permission_key === 'string'
    ? item.permission_key
    : typeof item.permissionKey === 'string'
      ? item.permissionKey
      : typeof item.key === 'string'
        ? item.key
        : typeof item.permission?.key === 'string'
          ? item.permission.key
          : '';

export const getRolePermissionModule = (item: BackendRolePermission) =>
  typeof item.module === 'string'
    ? item.module
    : typeof item.permission?.module === 'string'
      ? item.permission.module
      : '';

export const buildRowsFromLeftJoinedRolePermissions = (
  rolePermissions: BackendRolePermission[],
  moduleMeta: ModuleMetaMap,
  defaultPermissions: PermissionRow[] = [],
) => {
  if (!rolePermissions.length) return defaultPermissions;

  const grouped: Record<string, PermissionRow> = {};

  for (const rolePerm of rolePermissions) {
    const key = getRolePermissionKey(rolePerm);
    if (!key) continue;

    const parsed = parsePermissionKey(key);
    const moduleFromJoin = normalizeModuleKey(getRolePermissionModule(rolePerm));
    if (moduleFromJoin) parsed.moduleKey = moduleFromJoin;
    if (!parsed.moduleKey || !parsed.actionKey) continue;

    const meta = moduleMeta[parsed.moduleKey];
    const rowKey = parsed.moduleKey;

    if (!grouped[rowKey]) {
      grouped[rowKey] = {
        key: rowKey,
        label: meta?.label ?? formatActionLabel(parsed.moduleKey),
        icon: meta?.icon,
        permissions: {},
      };
    }

    const explicit = getExplicitRolePermissionValue(rolePerm);
    const rolePermissionId = getRolePermissionId(rolePerm);
    grouped[rowKey].permissions[parsed.actionKey] =
      explicit ?? rolePermissionId !== null;
  }

  const rows = Object.values(grouped).sort((a, b) => {
    const aOrder = moduleMeta[a.key]?.order ?? 999;
    const bOrder = moduleMeta[b.key]?.order ?? 999;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.label.localeCompare(b.label);
  });

  return rows.length ? rows : defaultPermissions;
};

export const buildPermissionIdByCell = (
  rolePermissions: BackendRolePermission[],
) => {
  const map: Record<string, number> = {};

  for (const rolePerm of rolePermissions) {
    const key = getRolePermissionKey(rolePerm);
    if (!key) continue;

    const parsed = parsePermissionKey(key);
    const moduleFromJoin = normalizeModuleKey(getRolePermissionModule(rolePerm));
    if (moduleFromJoin) parsed.moduleKey = moduleFromJoin;
    if (!parsed.moduleKey || !parsed.actionKey) continue;

    const permissionID = getRolePermissionId(rolePerm);
    if (permissionID === null) continue;

    map[`${parsed.moduleKey}::${parsed.actionKey}`] = permissionID;
  }

  return map;
};

export const fetchFirstAvailable = async <T,>(endpoints: string[]): Promise<T[]> => {
  let lastError: unknown = null;

  for (const endpoint of endpoints) {
    try {
      const res = await privateRequest.get(endpoint);
      return toArray<T>(res.data);
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) throw lastError;
  return [];
};
