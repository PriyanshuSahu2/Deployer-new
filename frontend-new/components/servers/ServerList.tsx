'use client';

import {
  ActionIcon,
  Box,
  Button,
  Card,
  Center,
  Group,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconPlus, IconSearch, IconServer2, IconX } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useDeleteServer, useGetServers, useTestConnection } from '@/hooks/useServers';
import { type Server } from '@/types/server';
import CreateServerDrawer from './CreateServerDrawer';
import ServerCard from './ServerCard';

interface Props {
  workspaceId: string;
}

export default function ServerList({ workspaceId }: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedServer, setSelectedServer] = useState<Server | null>(null);
  const [search, setSearch] = useState('');
  const { data: servers = [], isLoading } = useGetServers(workspaceId, true);
  const { mutateAsync: removeServer } = useDeleteServer(workspaceId);
  const { mutateAsync: testConnection } = useTestConnection(workspaceId);

  const filtered = useMemo(
    () =>
      servers.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.host.toLowerCase().includes(search.toLowerCase()) ||
          s.username.toLowerCase().includes(search.toLowerCase()),
      ),
    [servers, search],
  );

  const openCreate = () => {
    setSelectedServer(null);
    setDrawerOpen(true);
  };

  const openEdit = (server: Server) => {
    setSelectedServer(server);
    setDrawerOpen(true);
  };

  const handleDelete = async (server: Server) => {
    const confirmed = window.confirm(
      `Delete server "${server.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await removeServer(server.uuid);

      notifications.show({
        title: 'Server deleted',
        message: `"${server.name}" has been deleted.`,
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to delete the selected server';

      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  const skeletonCards = Array.from({ length: 3 }).map((_, index) => (
    <Card key={index} withBorder radius='md' padding='lg'>
      <Stack gap='md'>
        <Group justify='space-between'>
          <Group gap='sm'>
            <Skeleton height={42} circle />
            <Box>
              <Skeleton height={12} width={140} mb={8} />
              <Skeleton height={10} width={220} />
            </Box>
          </Group>
          <Skeleton height={24} width={24} />
        </Group>
        <Skeleton height={12} />
        <Skeleton height={12} width='80%' />
      </Stack>
    </Card>
  ));

  const handleTestConnection = async (server: Server) => {
    const notificationId = notifications.show({
      title: 'Testing connection',
      message: `Pinging ${server.host}...`,
      color: 'indigo',
      loading: true,
      autoClose: false,
    });

    try {
      await testConnection({ uuid: server.uuid });

      notifications.update({
        id: notificationId,
        title: 'Server connection tested',
        message: `"${server.name}" has been tested.`,
        color: 'teal',
        loading: false,
        autoClose: 3000,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to test the selected server';

      notifications.update({
        id: notificationId,
        title: 'Error',
        message,
        color: 'red',
        loading: false,
        autoClose: 3000,
      });
    }
  };
  return (
    <>
      <Stack gap='lg' p='md'>
        <Group justify='space-between' align='flex-end'>
          <Box>
            <Text size='xs' c='dimmed' tt='uppercase' fw={500} mb={4}>
              Workspace
            </Text>

            <Text fw={700} size='xl'>
              Servers / Infra
            </Text>

            <Text c='dimmed' size='sm' maw={700}>
              Manage the server targets available inside this workspace.
            </Text>
          </Box>

          <Button
            leftSection={<IconPlus size={15} />}
            radius='sm'
            size='sm'
            onClick={openCreate}>
            Add Server
          </Button>
        </Group>

        <TextInput
          placeholder='Search servers…'
          leftSection={<IconSearch size={15} />}
          rightSection={
            search ? (
              <ActionIcon
                variant='subtle'
                color='gray'
                size='xs'
                onClick={() => setSearch('')}>
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius='sm'
          styles={{ input: { fontSize: 'var(--mantine-font-size-sm)' } }}
        />

        {isLoading ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='lg'>
            {skeletonCards}
          </SimpleGrid>
        ) : filtered.length > 0 ? (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing='lg'>
            {filtered.map((server) => (
              <ServerCard
                key={server.uuid}
                server={server}
                onDelete={handleDelete}
                onEdit={openEdit}
                onTest={handleTestConnection}
              />
            ))}
          </SimpleGrid>
        ) : (
          <Center py='xl'>
            <Stack align='center' gap='xs'>
              <ThemeIcon size='lg' radius='md' variant='light' color='gray'>
                <IconServer2 size={18} />
              </ThemeIcon>
              <Text size='sm' c='dimmed'>
                {search ? 'No servers match your search' : 'No servers yet'}
              </Text>
            </Stack>
          </Center>
        )}
      </Stack>
      <CreateServerDrawer
        opened={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedServer(null);
        }}
        workspaceId={workspaceId}
        server={selectedServer}
      />
    </>
  );
}
