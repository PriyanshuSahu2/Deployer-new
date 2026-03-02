'use client';

import {
  Box,
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

export type CRUDMap = {
  create: boolean;
  read: boolean;
  update: boolean;
  delete: boolean;
};

export type PermissionRow = {
  key: string;
  label: string;
  icon: React.ReactNode;
  permissions: CRUDMap;
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

type Action = 'create' | 'read' | 'update' | 'delete';
const ACTIONS: Action[] = ['create', 'read', 'update', 'delete'];

interface Props {
  roleUuid: string;
}

export default function PermissionsMatrix({ roleUuid: _ }: Props) {
  const [rows, setRows] = useState<PermissionRow[]>(DEFAULT_PERMISSIONS);

  const toggle = (key: string, action: Action) => {
    setRows((prev) =>
      prev.map((r) =>
        r.key === key
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

  const toggleAll = (action: Action) => {
    const allChecked = rows.every((r) => r.permissions[action]);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        permissions: { ...r.permissions, [action]: !allChecked },
      })),
    );
  };

  const allChecked = (action: Action) =>
    rows.every((r) => r.permissions[action]);
  const someChecked = (action: Action) =>
    rows.some((r) => r.permissions[action]) && !allChecked(action);

  return (
    <Box
      style={(theme) => ({
        borderTop: `1px solid ${theme.colors.gray[2]}`,
        backgroundColor:
          'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-8))',
      })}>
      <Table
        horizontalSpacing='md'
        verticalSpacing='xs'
        style={{ tableLayout: 'fixed' }}>
        <Table.Thead>
          <Table.Tr
            style={(theme) => ({
              backgroundColor:
                'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-7))',
            })}>
            <Table.Th style={{ width: '40%', paddingLeft: 48 }}>
              <Text size='xs' fw={600} tt='uppercase' c='dimmed'>
                General
              </Text>
            </Table.Th>
            {ACTIONS.map((action) => (
              <Table.Th
                key={action}
                style={{ width: '15%', textAlign: 'left' }}>
                <Group justify='flex-start' gap={6} wrap='nowrap'>
                  <Checkbox
                    size='xs'
                    checked={allChecked(action)}
                    indeterminate={someChecked(action)}
                    onChange={() => toggleAll(action)}
                    styles={{ input: { cursor: 'pointer' } }}
                  />
                  <Text size='xs' fw={600} tt='uppercase' c='dimmed'>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
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
              style={(theme) => ({
                '&:hover': {
                  backgroundColor:
                    'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
                },
              })}>
              <Table.Td style={{ paddingLeft: 48 }}>
                <Group gap='xs' wrap='nowrap'>
                  <ThemeIcon size='xs' variant='transparent' c='dimmed'>
                    {row.icon}
                  </ThemeIcon>
                  <Text size='sm'>{row.label}</Text>
                </Group>
              </Table.Td>
              {ACTIONS.map((action) => (
                <Table.Td key={action} style={{ textAlign: 'left' }}>
                  <Group justify='flex-start'>
                    <Checkbox
                      size='xs'
                      checked={row.permissions[action]}
                      onChange={() => toggle(row.key, action)}
                      styles={{ input: { cursor: 'pointer' } }}
                    />
                  </Group>
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );
}
