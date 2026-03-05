'use client';

import {
  Box,
  Button,
  Checkbox,
  Table,
  Text,
  ThemeIcon,
  Group,
} from '@mantine/core';
import {
  IconCube,
  IconRocket,
  IconUsers,
  IconShield,
  IconBrandGithub,
  IconServer,
  IconGlobe,
  IconActivity,
  IconSettings,
} from '@tabler/icons-react';
import { useState } from 'react';

export type PermissionMap = Record<string, boolean>;

export type PermissionRow = {
  key: string;
  label: string;
  icon: React.ReactNode;
  permissions: PermissionMap;
};

const DEFAULT_PERMISSIONS: PermissionRow[] = [
  {
    key: 'projects',
    label: 'Projects',
    icon: <IconCube size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'deployments',
    label: 'Deployments',
    icon: <IconRocket size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'members',
    label: 'Members',
    icon: <IconUsers size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'roles',
    label: 'Roles',
    icon: <IconShield size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'integrations',
    label: 'Integrations',
    icon: <IconBrandGithub size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'servers',
    label: 'Servers / Infra',
    icon: <IconServer size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'domains',
    label: 'Domains',
    icon: <IconGlobe size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'logs',
    label: 'Logs & Audit',
    icon: <IconActivity size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
  {
    key: 'settings',
    label: 'Workspace Settings',
    icon: <IconSettings size={14} />,
    permissions: { create: false, read: false, update: false, delete: false },
  },
];

const formatActionLabel = (action: string) =>
  action
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getActionColumns = (rows: PermissionRow[]) => {
  const actions: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    for (const action of Object.keys(row.permissions)) {
      if (!seen.has(action)) {
        seen.add(action);
        actions.push(action);
      }
    }
  }
  return actions;
};

interface Props {
  roleUuid: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function PermissionsMatrix({ roleUuid }: Props) {
  const [rows, setRows] = useState<PermissionRow[]>(DEFAULT_PERMISSIONS);
  const actions = getActionColumns(rows);

  const hasAction = (row: PermissionRow, action: string) =>
    Object.prototype.hasOwnProperty.call(row.permissions, action);

  const toggle = (key: string, action: string) => {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key && hasAction(r, action)
          ? {
              ...r,
              permissions: {
                ...r.permissions,
                [action]: !r.permissions[action],
              },
            }
          : r,
      ),
    );
  };

  const toggleAll = (action: string) => {
    const applicableRows = rows.filter((r) => hasAction(r, action));
    if (!applicableRows.length) return;

    const actionAllChecked = applicableRows.every((r) => r.permissions[action]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        permissions: hasAction(r, action)
          ? { ...r.permissions, [action]: !actionAllChecked }
          : r.permissions,
      })),
    );
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
                    disabled={!rows.some((r) => hasAction(r, action))}
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

      {/* Save / Cancel action bar */}
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
        <Button variant='default' size='xs' radius='sm'>
          Cancel
        </Button>
        <Button size='xs' radius='sm'>
          Save
        </Button>
      </Group>
    </Box>
  );
}
