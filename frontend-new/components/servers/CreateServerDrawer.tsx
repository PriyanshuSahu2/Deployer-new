'use client';

import {
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  NumberInput,
  PasswordInput,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconCheck,
  IconPlugConnected,
  IconServer2,
  IconShieldLock,
  IconWorld,
} from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useCreateServer, useTestConnection, useUpdateServer } from '@/hooks/useServers';
import { type Server } from '@/types/server';

const authTypeOptions = [
  { value: 'ssh_key', label: 'SSH Key' },
  { value: 'password', label: 'Password' },
  { value: 'agent', label: 'SSH Agent' },
];

interface CreateServerDrawerProps {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  server?: Server | null;
}

export default function CreateServerDrawer({
  opened,
  onClose,
  workspaceId,
  server,
}: CreateServerDrawerProps) {
  const isEditing = !!server;
  const { mutateAsync: createServer, isPending: creating } =
    useCreateServer(workspaceId);
  const { mutateAsync: updateServer, isPending: updating } =
    useUpdateServer(workspaceId);
  const { mutateAsync: testConnection } = useTestConnection(workspaceId);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const isPending = creating || updating;
  const ipv4Pattern =
    /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  const form = useForm({
    initialValues: {
      name: '',
      host: '',
      port: 22,
      username: '',
      auth_type: 'ssh_key',
      pass_key: '',
      password: '',
      agent_socket: '',
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      host: (value) => {
        const trimmedValue = value.trim();
        if (!trimmedValue) return 'Host is required';
        if (!ipv4Pattern.test(trimmedValue)) {
          return 'Enter a valid IPv4 address';
        }
        return null;
      },
      port: (value) =>
        !value || value < 1 || value > 65535 ? 'Enter a valid port' : null,
      username: (value) => (!value.trim() ? 'Username is required' : null),
      auth_type: (value) => (!value ? 'Choose an auth type' : null),
      pass_key: (value, values) =>
        values.auth_type === 'ssh_key' && !value.trim()
          ? 'Pass key is required'
          : null,
    },
  });

  useEffect(() => {
    if (!opened) return;
    if (server) {
      form.setValues({
        name: server.name,
        host: server.host,
        port: server.port,
        username: server.username,
        auth_type: server.auth_type || 'ssh_key',
        pass_key: server.pass_key ?? '',
        password: '',
        agent_socket: '',
      });
      return;
    }
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, server]);

  const handleTestConnection = async () => {
    const validation = form.validate();
    if (validation.hasErrors) {
      notifications.show({
        title: 'Connection test failed',
        message: 'Fill in the required server details before testing.',
        color: 'red',
      });
      return;
    }

    setIsTestingConnection(true);

    try {
      await testConnection({
        host: form.values.host,
        port: form.values.port,
        username: form.values.username,
        auth_type: form.values.auth_type,
        pass_key: form.values.pass_key,
      });

      notifications.show({
        title: 'Connected',
        message: `Connected to ${form.values.host}:${form.values.port} as ${form.values.username}.`,
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data
          ? String(err.response.data.error)
          : err instanceof Error
            ? err.message
            : 'Failed to connect to server';

      notifications.show({
        title: 'Connection failed',
        message,
        color: 'red',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      const payload = {
        name: values.name.trim(),
        host: values.host.trim(),
        port: values.port,
        username: values.username.trim(),
        auth_type: values.auth_type,
        pass_key: values.auth_type === 'ssh_key' ? values.pass_key.trim() : '',
      };

      if (isEditing && server) {
        await updateServer({
          uuid: server.uuid,
          ...payload,
        });

        notifications.show({
          title: 'Server updated',
          message: `"${values.name}" has been updated.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      } else {
        await createServer(payload);

        notifications.show({
          title: 'Server created',
          message: `"${values.name}" has been created.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      }

      onClose();
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'error' in err.response.data
          ? String(err.response.data.error)
          : err instanceof Error
            ? err.message
            : 'Failed to create server';

      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  });

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position='right'
      size='md'
      padding='xl'
      title={
        <Group gap='md' align='center'>
          <ThemeIcon size={40} radius='md' variant='light' color='indigo'>
            <IconServer2 size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size='lg' lh={1.2}>
              {isEditing ? 'Edit Server' : 'Create Server'}
            </Text>
            <Text size='sm' c='dimmed' mt={2}>
              {isEditing ? 'Update the server' : 'Add a server'}
            </Text>
          </Box>
        </Group>
      }
      styles={{
        header: {
          borderBottom: '1px solid var(--mantine-color-default-border)',
          paddingBottom: 'var(--mantine-spacing-sm)',
        },
        body: {
          paddingTop: 'var(--mantine-spacing-lg)',
        },
      }}>
      <form onSubmit={handleSubmit}>
        <Stack gap='lg'>
          <TextInput
            label='Server Name'
            placeholder='e.g. Production VPS'
            description='A short name your team will recognize'
            withAsterisk
            radius='sm'
            {...form.getInputProps('name')}
          />

          <TextInput
            label='Host'
            placeholder='203.0.113.10'
            description='IPv4 address for the target server'
            withAsterisk
            leftSection={<IconWorld size={16} />}
            inputMode='numeric'
            radius='sm'
            {...form.getInputProps('host')}
            onChange={(event) => {
              const nextValue = event.currentTarget.value.replace(
                /[^0-9.]/g,
                '',
              );
              form.setFieldValue('host', nextValue);
            }}
          />

          <NumberInput
            label='Port'
            description='Connection port used for this server'
            min={1}
            max={65535}
            withAsterisk
            radius='sm'
            {...form.getInputProps('port')}
          />

          <TextInput
            label='Username'
            placeholder='ubuntu'
            description='User account used for connection'
            withAsterisk
            radius='sm'
            {...form.getInputProps('username')}
          />

          <Select
            label='Authentication Type'
            description='Choose how this server should authenticate'
            data={authTypeOptions}
            leftSection={<IconShieldLock size={16} />}
            radius='sm'
            {...form.getInputProps('auth_type')}
          />

          {form.values.auth_type === 'ssh_key' ? (
            <Textarea
              label='Pass Key'
              placeholder='Paste the pass key here'
              description='Key text used for this server connection'
              autosize
              minRows={4}
              radius='sm'
              {...form.getInputProps('pass_key')}
            />
          ) : null}

          {form.values.auth_type === 'password' ? (
            <PasswordInput
              label='Password'
              placeholder='Enter server password'
              description='Frontend-only input for connection testing'
              radius='sm'
              {...form.getInputProps('password')}
            />
          ) : null}

          {form.values.auth_type === 'agent' ? (
            <TextInput
              label='Agent Socket'
              placeholder='/run/user/1000/ssh-agent.socket'
              description='Frontend-only input for connection testing'
              radius='sm'
              {...form.getInputProps('agent_socket')}
            />
          ) : null}

          <Divider />

          <Group justify='space-between' gap='sm'>
            <Button
              variant='light'
              color='cyan'
              leftSection={<IconPlugConnected size={16} />}
              loading={isTestingConnection}
              onClick={handleTestConnection}>
              Test Connection
            </Button>

            <Group justify='flex-end' gap='sm'>
              <Button
                variant='default'
                radius='sm'
                onClick={onClose}
                disabled={isPending}>
                Cancel
              </Button>
              <Button type='submit' radius='sm' loading={isPending}>
                {isEditing ? 'Update' : 'Create'}
              </Button>
            </Group>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
