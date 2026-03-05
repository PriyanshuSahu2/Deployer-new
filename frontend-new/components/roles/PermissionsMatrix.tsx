'use client';

import {
  Box,
  Button,
  Checkbox,
  Group,
  Loader,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconActivity,
  IconBrandGithub,
  IconCube,
  IconGlobe,
  IconRocket,
  IconServer,
  IconSettings,
  IconShield,
  IconUsers,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { privateRequest } from '@/lib/requestMethod';
import type {
  BackendRolePermission,
  ModuleMetaMap,
  PermissionMap,
  PermissionRow,
} from './PermissionsMatrix.types';
import {
  buildPermissionIdByCell,
  buildRowsFromLeftJoinedRolePermissions,
  fetchFirstAvailable,
  formatActionLabel,
  getActionColumns,
} from './PermissionsMatrix.utils';

const DEFAULT_PERMISSIONS: PermissionRow[] = [];

const MODULE_META: ModuleMetaMap = {
  project: { label: 'Projects', icon: <IconCube size={14} />, order: 0 },
  deployment: {
    label: 'Deployments',
    icon: <IconRocket size={14} />,
    order: 1,
  },
  member: { label: 'Members', icon: <IconUsers size={14} />, order: 2 },
  role: { label: 'Roles', icon: <IconShield size={14} />, order: 3 },
  integration: {
    label: 'Integrations',
    icon: <IconBrandGithub size={14} />,
    order: 4,
  },
  server: { label: 'Servers / Infra', icon: <IconServer size={14} />, order: 5 },
  domain: { label: 'Domains', icon: <IconGlobe size={14} />, order: 6 },
  log: { label: 'Logs & Audit', icon: <IconActivity size={14} />, order: 7 },
  workspace: {
    label: 'Workspace Settings',
    icon: <IconSettings size={14} />,
    order: 8,
  },
};

interface Props {
  roleUuid: string;
  isSystemRole?: boolean;
}

export default function PermissionsMatrix({
  roleUuid,
  isSystemRole = false,
}: Props) {
  const [edits, setEdits] = useState<Record<string, PermissionMap>>({});
  const [isSaving, setIsSaving] = useState(false);

  const rolePermissionsQuery = useQuery({
    queryKey: ['role-permissions', roleUuid],
    enabled: Boolean(roleUuid),
    queryFn: () =>
      fetchFirstAvailable<BackendRolePermission>([
        `/rolepermission/${roleUuid}`,
        `/rolepermissions/${roleUuid}`,
        `/role-permissions/${roleUuid}`,
      ]),
  });

  const serverRows = useMemo(
    () =>
      buildRowsFromLeftJoinedRolePermissions(
        rolePermissionsQuery.data ?? [],
        MODULE_META,
        DEFAULT_PERMISSIONS,
      ),
    [rolePermissionsQuery.data],
  );

  const rows = useMemo(
    () =>
      serverRows.map((row) => ({
        ...row,
        permissions: {
          ...row.permissions,
          ...(edits[row.key] ?? {}),
        },
      })),
    [edits, serverRows],
  );

  const permissionIdByCell = useMemo(
    () => buildPermissionIdByCell(rolePermissionsQuery.data ?? []),
    [rolePermissionsQuery.data],
  );

  const hasUnsavedChanges = useMemo(() => {
    if (!Object.keys(edits).length) return false;
    return Object.values(edits).some((row) => Object.keys(row).length > 0);
  }, [edits]);

  const isLoading = rolePermissionsQuery.isLoading;
  const actions = getActionColumns(rows);

  const hasAction = (row: PermissionRow, action: string) =>
    Object.prototype.hasOwnProperty.call(row.permissions, action);

  const toggle = (key: string, action: string) => {
    if (isSystemRole) return;
    setEdits((prev) => {
      const row = rows.find((r) => r.key === key);
      if (!row || !hasAction(row, action)) return prev;

      return {
        ...prev,
        [key]: {
          ...(prev[key] ?? {}),
          [action]: !row.permissions[action],
        },
      };
    });
  };

  const toggleAll = (action: string) => {
    if (isSystemRole) return;
    const applicableRows = rows.filter((r) => hasAction(r, action));
    if (!applicableRows.length) return;

    const actionAllChecked = applicableRows.every((r) => r.permissions[action]);
    const nextValue = !actionAllChecked;

    setEdits((prev) => {
      const next = { ...prev };
      for (const row of applicableRows) {
        next[row.key] = {
          ...(next[row.key] ?? {}),
          [action]: nextValue,
        };
      }
      return next;
    });
  };

  const allChecked = (action: string) => {
    const applicableRows = rows.filter((r) => hasAction(r, action));
    if (!applicableRows.length) return false;
    return applicableRows.every((r) => r.permissions[action]);
  };

  const someChecked = (action: string) => {
    const applicableRows = rows.filter((r) => hasAction(r, action));
    if (!applicableRows.length) return false;
    return (
      applicableRows.some((r) => r.permissions[action]) && !allChecked(action)
    );
  };

  const handleCancel = () => {
    if (isSystemRole) return;
    setEdits({});
  };

  const handleSave = async () => {
    if (!roleUuid || isSaving || isSystemRole) return;

    const selectedPermissionIDs = new Set<number>();
    for (const row of rows) {
      for (const [action, allowed] of Object.entries(row.permissions)) {
        if (!allowed) continue;
        const permissionID = permissionIdByCell[`${row.key}::${action}`];
        if (permissionID) selectedPermissionIDs.add(permissionID);
      }
    }

    try {
      setIsSaving(true);
      await privateRequest.put(`/rolepermission/${roleUuid}`, {
        role_uuid: roleUuid,
        permission_ids: Array.from(selectedPermissionIDs),
      });
      setEdits({});
      await rolePermissionsQuery.refetch();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box
      style={(theme) => ({
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        backgroundColor:
          'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
        overflowX: 'auto',
      })}>
      <Table
        horizontalSpacing='md'
        verticalSpacing='xs'
        style={{ minWidth: Math.max(640, 260 + actions.length * 120) }}>
        <Table.Thead>
          <Table.Tr
            style={{
              backgroundColor:
                'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))',
            }}>
            <Table.Th style={{ width: 260, paddingLeft: 48 }}>
              <Text size='xs' fw={600} tt='uppercase' c='dimmed'>
                General
              </Text>
            </Table.Th>
            {actions.map((action) => (
              <Table.Th
                key={action}
                style={{ minWidth: 120, textAlign: 'left' }}>
                <Group justify='flex-start' gap={6} wrap='nowrap'>
                  <Checkbox
                    size='xs'
                    checked={allChecked(action)}
                    indeterminate={someChecked(action)}
                    onChange={() => toggleAll(action)}
                    disabled={
                      isSystemRole || !rows.some((r) => hasAction(r, action))
                    }
                    styles={{ input: { cursor: 'pointer' } }}
                  />
                  <Text size='xs' fw={600} tt='uppercase' c='dimmed'>
                    {formatActionLabel(action)}
                  </Text>
                </Group>
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {isLoading && (
            <Table.Tr>
              <Table.Td colSpan={Math.max(1, actions.length + 1)}>
                <Group justify='center' py='md' gap='xs'>
                  <Loader size='xs' />
                  <Text size='xs' c='dimmed'>
                    Loading permissions...
                  </Text>
                </Group>
              </Table.Td>
            </Table.Tr>
          )}

          {rows.map((row) => (
            <Table.Tr
              key={row.key}
              style={{
                '&:hover': {
                  backgroundColor:
                    'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
                },
              }}>
              <Table.Td style={{ paddingLeft: 48 }}>
                <Group gap='xs' wrap='nowrap'>
                  <ThemeIcon size='xs' variant='transparent' c='dimmed'>
                    {row.icon}
                  </ThemeIcon>
                  <Text size='sm'>{row.label}</Text>
                </Group>
              </Table.Td>

              {actions.map((action) => (
                <Table.Td key={action} style={{ textAlign: 'left' }}>
                  {hasAction(row, action) ? (
                    <Group justify='flex-start'>
                      <Checkbox
                        size='xs'
                        checked={row.permissions[action]}
                        onChange={() => toggle(row.key, action)}
                        disabled={isSystemRole}
                        styles={{ input: { cursor: 'pointer' } }}
                      />
                    </Group>
                  ) : (
                    <Text size='xs' c='dimmed'>
                      -
                    </Text>
                  )}
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {!isSystemRole && (
        <Group
          justify='flex-end'
          gap='sm'
          px='md'
          py='sm'
          style={(theme) => ({
            borderTop: `1px solid light-dark(${theme.colors.gray[2]}, ${theme.colors.dark[5]})`,
            backgroundColor:
              'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
          })}>
          <Button
            variant='default'
            size='xs'
            radius='sm'
            onClick={handleCancel}
            disabled={isSaving || !hasUnsavedChanges}>
            Cancel
          </Button>
          <Button
            size='xs'
            radius='sm'
            onClick={handleSave}
            loading={isSaving}
            disabled={!hasUnsavedChanges}>
            Save
          </Button>
        </Group>
      )}
    </Box>
  );
}
