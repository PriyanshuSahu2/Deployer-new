'use client';

import {
  Button,
  Center,
  CopyButton,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { IconCopy, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useWorkspaceSettings } from '@/hooks/useWorkspace';
import WorkspaceAPI from './WorkspaceAPI';
import WorkspaceGeneral from './WorkspaceGeneral';
import WorkspaceOwnership from './WorkspaceOwnership';
import WorkspaceSecurity from './WorkspaceSecurity';

interface WorkspaceSettingsClientProps {
  workspaceId: string;
}

export default function WorkspaceSettingsClient({
  workspaceId,
}: WorkspaceSettingsClientProps) {
  const { data: settings, isLoading, isError, refetch, isFetching } =
    useWorkspaceSettings(workspaceId);

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader size="xl" />
      </Center>
    );
  }

  if (isError || !settings) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Text c="red" fw={600}>
            Failed to load workspace settings.
          </Text>
          <Button
            radius="sm"
            variant="light"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            Workspace
          </Text>
          <Text fw={700} size="xl">
            Settings
          </Text>
        </Stack>
        <Button
          radius="sm"
          size="sm"
          variant="light"
          leftSection={<IconRefresh size={15} />}
          loading={isFetching}
          onClick={() => refetch()}
        >
          Refresh
        </Button>
      </Group>

      <WorkspaceGeneral workspaceId={workspaceId} settings={settings} />
      <WorkspaceSecurity workspaceId={workspaceId} settings={settings} />
      <WorkspaceAPI workspaceId={workspaceId} settings={settings} />
      <Paper withBorder radius="sm" p="md">
        <Stack gap="md">
          <Text fw={700}>Metadata</Text>
          <Group justify="space-between">
            <Stack gap={2}>
              <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                Workspace ID
              </Text>
              <Text size="sm">{settings.uuid}</Text>
            </Stack>
            <CopyButton value={settings.uuid}>
              {({ copied, copy }) => (
                <Button
                  radius="sm"
                  variant="light"
                  size="xs"
                  leftSection={<IconCopy size={13} />}
                  onClick={copy}
                >
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              )}
            </CopyButton>
          </Group>
          <Stack gap={2}>
            <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
              Created At
            </Text>
            <Text size="sm">
              {dayjs(settings.createdAt).format('MMM D, YYYY h:mm A')}
            </Text>
          </Stack>
        </Stack>
      </Paper>
      <WorkspaceOwnership workspaceId={workspaceId} settings={settings} />
    </Stack>
  );
}
