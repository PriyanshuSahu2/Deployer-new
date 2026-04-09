import { Badge, Box, Group, Stack, Text } from '@mantine/core';
import { IconServer, IconUsers } from '@tabler/icons-react';
import { roleRows, userRows } from './data';

export default function DashboardPreview() {
  return (
    <Box
      p='lg'
      style={{
        border: '1px solid var(--mantine-color-gray-3)',
        borderRadius: 'var(--mantine-radius-md)',
        background: 'var(--mantine-color-white)',
      }}>
      <Stack gap='md'>
        <Group justify='space-between'>
          <div>
            <Text size='xs' c='dimmed' tt='uppercase' fw={500} mb={4}>
              Platform Overview
            </Text>
            <Text size='1.25rem' fw={700}>
              Deployment Dashboard
            </Text>
          </div>
          <Badge color='green' variant='light'>
            Operational
          </Badge>
        </Group>

        <div className='grid gap-4 sm:grid-cols-2'>
          <Box
            p='md'
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
            }}>
            <Group justify='space-between' mb='xs'>
              <Text size='sm' c='dimmed'>
                Active Services
              </Text>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--mantine-radius-md)',
                  background: 'var(--mantine-color-indigo-light)',
                  color: 'var(--mantine-color-indigo-filled)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconUsers size={16} />
              </Box>
            </Group>
            <Text size='1.5rem' fw={700}>
              24
            </Text>
            <Text size='sm' c='dimmed'>
              production and staging services
            </Text>
          </Box>

          <Box
            p='md'
            style={{
              border: '1px solid var(--mantine-color-gray-3)',
              borderRadius: 'var(--mantine-radius-md)',
            }}>
            <Group justify='space-between' mb='xs'>
              <Text size='sm' c='dimmed'>
                Connected Servers
              </Text>
              <Box
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 'var(--mantine-radius-md)',
                  background: 'var(--mantine-color-indigo-light)',
                  color: 'var(--mantine-color-indigo-filled)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <IconServer size={16} />
              </Box>
            </Group>
            <Text size='1.5rem' fw={700}>
              8
            </Text>
            <Text size='sm' c='dimmed'>
              deploy targets online
            </Text>
          </Box>
        </div>

        <Box
          style={{
            border: '1px solid var(--mantine-color-gray-3)',
            borderRadius: 'var(--mantine-radius-md)',
            overflow: 'hidden',
          }}>
          <div className='grid grid-cols-[1.8fr_1fr_1fr] border-b border-gray-200 px-4 py-3 text-sm text-gray-500'>
            <span>Member</span>
            <span>Role</span>
            <span>Status</span>
          </div>
          {userRows.map((user) => (
            <div
              key={user.email}
              className='grid grid-cols-[1.8fr_1fr_1fr] items-center border-b border-gray-100 px-4 py-3 last:border-b-0'>
              <div>
                <Text fw={500}>{user.name}</Text>
                <Text size='xs' c='dimmed'>
                  {user.email}
                </Text>
              </div>
              <Text size='sm'>{user.role}</Text>
              <Badge
                variant='light'
                color={user.status === 'Active' ? 'green' : 'yellow'}
                w='fit-content'>
                {user.status}
              </Badge>
            </div>
          ))}
        </Box>

        <div className='grid gap-4 sm:grid-cols-3'>
          {roleRows.map((role) => (
            <Box
              key={role.name}
              p='md'
              style={{
                border: '1px solid var(--mantine-color-gray-3)',
                borderRadius: 'var(--mantine-radius-md)',
              }}>
              <Text fw={600}>{role.name}</Text>
              <Text size='sm' c='dimmed' mt={4}>
                {role.description}
              </Text>
            </Box>
          ))}
        </div>
      </Stack>
    </Box>
  );
}
