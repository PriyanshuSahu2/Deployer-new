'use client';

import { Table, Paper, Text } from '@mantine/core';
import { Role } from '@/types/role';

interface Props {
  roles: Role[];
}

export default function RoleList({ roles }: Props) {
  if (!roles.length) {
    return (
      <Text c='dimmed' size='sm'>
        No roles added yet.
      </Text>
    );
  }

  return (
    <Paper shadow='xs' withBorder>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Description</Table.Th>
            <Table.Th>Created</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {roles.map((role) => (
            <Table.Tr key={role.uuid}>
              <Table.Td>{role.name}</Table.Td>
              <Table.Td>{role.description}</Table.Td>
              <Table.Td>
                {new Date(role.created_at).toLocaleDateString()}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
