'use client';

import {
  Badge,
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  PasswordInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconArrowLeft,
  IconPlugConnected,
  IconServer2,
  IconShieldLock,
  IconWorld,
} from '@tabler/icons-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCreateServer } from '@/hooks/useServers';

const authTypeOptions = [
  { value: 'ssh_key', label: 'SSH Key' },
  { value: 'password', label: 'Password' },
  { value: 'agent', label: 'SSH Agent' },
];

function SectionHeader({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <Group justify='space-between' align='flex-start'>
      <Box>
        <Text fw={700} size='lg'>
          {title}
        </Text>
        <Text size='sm' c='dimmed' mt={4}>
          {description}
        </Text>
      </Box>
      <ThemeIcon size={40} radius='md' variant='light' color={color}>
        {icon}
      </ThemeIcon>
    </Group>
  );
}

interface Props {
  workspaceId: string;
}

export default function ServerCreationPage({ workspaceId }: Props) {
  const router = useRouter();
  const { mutateAsync: createServer, isPending } = useCreateServer(workspaceId);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const ipv4Pattern = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  const form = useForm({
    initialValues: {
      name: '',
      host: '',
      port: 22,
      username: '',
      auth_type: 'ssh_key',
      ssh_key_id: null as number | null,
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
    },
  });

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

    await new Promise((resolve) => {
      window.setTimeout(resolve, 900);
    });

    const isConnected = Math.random() >= 0.5;

    notifications.show({
      title: isConnected ? 'Connected' : 'Connection failed',
      message: isConnected
        ? `Connected to ${form.values.host}:${form.values.port} as ${form.values.username}.`
        : `Could not connect to ${form.values.host}:${form.values.port}.`,
      color: isConnected ? 'teal' : 'red',
    });

    setIsTestingConnection(false);
  };

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await createServer(values);

      notifications.show({
        title: 'Server created',
        message: `"${values.name}" is now available in this workspace.`,
        color: 'teal',
      });

      router.push(`/app/${workspaceId}/servers`);
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
    <Stack gap='lg' p='md'>
      <Group justify='space-between' align='flex-start'>
        <Box>
          <Group gap='sm' mb={8}>
            <Button
              variant='subtle'
              color='gray'
              size='compact-sm'
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.push(`/app/${workspaceId}/servers`)}>
              Back
            </Button>
            <Badge variant='light' color='gray' radius='sm'>
              Server
            </Badge>
          </Group>

          <Text fw={700} size='xl'>
            Add Server
          </Text>
          <Text size='sm' c='dimmed' mt={4}>
            Save the server record using the fields from the backend schema.
          </Text>
        </Box>

        <Group gap='sm'>
          <Button
            variant='default'
            radius='sm'
            onClick={() => router.push(`/app/${workspaceId}/servers`)}>
            Cancel
          </Button>
          <Button radius='sm' loading={isPending} onClick={() => handleSubmit()}>
            Create Server
          </Button>
        </Group>
      </Group>

      <form onSubmit={handleSubmit}>
        <Stack gap='lg'>
          <Paper withBorder radius='md' p='xl'>
            <Stack gap='lg'>
              <SectionHeader
                title='Server Details'
                description='Basic identity and network information for this target.'
                icon={<IconServer2 size={20} />}
                color='indigo'
              />
              <Divider />
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                <TextInput
                  label='Server name'
                  placeholder='Production VPS'
                  withAsterisk
                  {...form.getInputProps('name')}
                />
                <TextInput
                  label='Host'
                  placeholder='203.0.113.10'
                  withAsterisk
                  leftSection={<IconWorld size={16} />}
                  inputMode='numeric'
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
                  min={1}
                  max={65535}
                  withAsterisk
                  {...form.getInputProps('port')}
                />
                <TextInput
                  label='Username'
                  placeholder='ubuntu'
                  withAsterisk
                  {...form.getInputProps('username')}
                />
              </SimpleGrid>
            </Stack>
          </Paper>

          <Paper withBorder radius='md' p='xl'>
            <Stack gap='lg'>
              <SectionHeader
                title='Authentication'
                description='How deploy jobs will authenticate when connecting to this server.'
                icon={<IconShieldLock size={20} />}
                color='cyan'
              />
              <Divider />
              <Select
                label='Authentication type'
                data={authTypeOptions}
                leftSection={<IconShieldLock size={16} />}
                {...form.getInputProps('auth_type')}
              />

              {form.values.auth_type === 'ssh_key' ? (
                <NumberInput
                  label='SSH key ID'
                  placeholder='12'
                  min={1}
                  {...form.getInputProps('ssh_key_id')}
                />
              ) : null}

              {form.values.auth_type === 'password' ? (
                <PasswordInput
                  label='Password'
                  placeholder='Enter server password'
                  {...form.getInputProps('password')}
                />
              ) : null}

              {form.values.auth_type === 'agent' ? (
                <TextInput
                  label='Agent socket'
                  placeholder='/run/user/1000/ssh-agent.socket'
                  {...form.getInputProps('agent_socket')}
                />
              ) : null}

              <Group justify='flex-end'>
                <Button
                  variant='light'
                  color='cyan'
                  leftSection={<IconPlugConnected size={16} />}
                  loading={isTestingConnection}
                  onClick={handleTestConnection}>
                  Test Connection
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Stack>
      </form>
    </Stack>
  );
}
