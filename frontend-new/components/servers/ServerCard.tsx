import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconActivity,
  IconPencil,
  IconServer2,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import { type Server } from '@/types/server';

interface ServerCardProps {
  server: Server;
  onEdit: (server: Server) => void;
  onTest: (server: Server) => void;
  onDelete: (server: Server) => void;
  isWorking?: boolean;
}

export default function ServerCard({
  server,
  onEdit,
  onTest,
  onDelete,
  isWorking = false,
}: ServerCardProps) {
  return (
    <Card withBorder radius='md' p='md'>
      <Group justify='space-between' align='flex-start' mb='xs'>
        <Group gap='sm'>
          <ThemeIcon size={38} radius='md' variant='light' color='indigo'>
            <IconServer2 size={20} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Text fw={600} size='sm' lh={1.2}>
              {server.name}
            </Text>
            <Text size='xs' c='dimmed' mt={4}>
              {server.host}:{server.port}
            </Text>
          </Box>
        </Group>

        <Badge
          size='xs'
          variant='light'
          color={
            server.auth_type === 'password'
              ? 'blue'
              : server.auth_type === 'key'
                ? 'green'
                : 'gray'
          }>
          {server.auth_type || 'unspecified'}
        </Badge>
      </Group>

      <Text size='xs' c='dimmed' mb='md'>
        Created {dayjs(server.created_at).format('MMM D, YYYY')}
      </Text>

      <Group justify='space-between' align='center'>
        <Group gap={6}>
          <IconUser
            size={14}
            style={{ color: 'var(--mantine-color-dimmed)' }}
          />
          <Text size='xs' c='dimmed'>
            {server.username}
          </Text>
        </Group>

        <Group gap={6} wrap='nowrap'>
          <Tooltip label='Test connection' withArrow fz='xs'>
            <ActionIcon
              variant='light'
              color='teal'
              size='sm'
              onClick={() => onTest(server)}>
              <IconActivity size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Edit server' withArrow fz='xs'>
            <ActionIcon
              variant='light'
              color='blue'
              size='sm'
              onClick={() => onEdit(server)}>
              <IconPencil size={14} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label='Delete server' withArrow fz='xs'>
            <ActionIcon
              variant='light'
              color='red'
              size='sm'
              loading={isWorking}
              onClick={() => onDelete(server)}>
              <IconTrash size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
    </Card>
  );
}
