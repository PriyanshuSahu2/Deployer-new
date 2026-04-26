'use client';

import {
  ActionIcon,
  Button,
  Code,
  CopyButton,
  Group,
  Modal,
  Paper,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCopy, IconKey, IconPlus, IconTrash } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  useCreateWorkspaceAPIKey,
  useRevokeWorkspaceAPIKey,
} from '@/hooks/useWorkspace';
import type { WorkspaceSettings } from '@/types/workspace-settings';

interface WorkspaceAPIProps {
  workspaceId: string;
  settings: WorkspaceSettings;
}

export default function WorkspaceAPI({ workspaceId, settings }: WorkspaceAPIProps) {
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const { mutateAsync: createKey, isPending: isCreating } =
    useCreateWorkspaceAPIKey(workspaceId);
  const { mutateAsync: revokeKey, isPending: isRevoking } =
    useRevokeWorkspaceAPIKey(workspaceId);

  const form = useForm({
    initialValues: {
      name: '',
    },
    validate: {
      name: (value) =>
        value.trim().length < 2 ? 'Key name must be at least 2 characters' : null,
    },
  });

  const handleCreate = form.onSubmit(async (values) => {
    try {
      const response = await createKey(values.name.trim());
      setGeneratedKey(response.data.key);
      form.reset();
      notifications.show({
        title: 'API key generated',
        message: 'Store the key now. It will not be shown again.',
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to generate API key';
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  });

  const handleRevoke = async (keyUUID: string) => {
    const confirmed = window.confirm('Revoke this API key? This cannot be undone.');
    if (!confirmed) return;

    try {
      await revokeKey(keyUUID);
      notifications.show({
        title: 'API key revoked',
        message: 'The workspace API key has been revoked.',
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to revoke API key';
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  };

  return (
    <>
      <Paper withBorder radius="sm" p="md">
        <Stack gap="lg">
          <Group justify="space-between" align="flex-start">
            <Stack gap={4}>
              <Text fw={700}>API Access</Text>
              <Text size="sm" c="dimmed">
                Workspace-scoped keys for automation and external tooling.
              </Text>
            </Stack>
          </Group>

          {settings.isOwner && (
            <form onSubmit={handleCreate}>
              <Group align="flex-end">
                <TextInput
                  label="Key name"
                  placeholder="CI deployer"
                  radius="sm"
                  style={{ flex: 1 }}
                  leftSection={<IconKey size={15} />}
                  {...form.getInputProps('name')}
                />
                <Button
                  type="submit"
                  radius="sm"
                  loading={isCreating}
                  leftSection={<IconPlus size={15} />}
                >
                  Generate key
                </Button>
              </Group>
            </form>
          )}

          <Table.ScrollContainer minWidth={620}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Prefix</Table.Th>
                  <Table.Th>Created</Table.Th>
                  <Table.Th>Last Used</Table.Th>
                  {settings.isOwner && <Table.Th />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {settings.apiKeys.length > 0 ? (
                  settings.apiKeys.map((key) => (
                    <Table.Tr key={key.uuid}>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {key.name}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Code>{key.prefix}</Code>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dayjs(key.createdAt).format('MMM D, YYYY')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {key.lastUsedAt
                            ? dayjs(key.lastUsedAt).format('MMM D, YYYY')
                            : 'Never'}
                        </Text>
                      </Table.Td>
                      {settings.isOwner && (
                        <Table.Td>
                          <Group justify="flex-end">
                            <Tooltip label="Revoke key">
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                loading={isRevoking}
                                onClick={() => handleRevoke(key.uuid)}
                              >
                                <IconTrash size={16} />
                              </ActionIcon>
                            </Tooltip>
                          </Group>
                        </Table.Td>
                      )}
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={settings.isOwner ? 5 : 4}>
                      <Text ta="center" c="dimmed" py="md">
                        No workspace API keys.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Stack>
      </Paper>

      <Modal
        opened={!!generatedKey}
        onClose={() => setGeneratedKey(null)}
        title="API key generated"
        radius="sm"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            This key is shown once. Store it in your secret manager before closing.
          </Text>
          <Code block>{generatedKey}</Code>
          <Group justify="flex-end">
            <CopyButton value={generatedKey ?? ''}>
              {({ copied, copy }) => (
                <Button
                  radius="sm"
                  variant="light"
                  onClick={copy}
                  leftSection={<IconCopy size={15} />}
                >
                  {copied ? 'Copied' : 'Copy key'}
                </Button>
              )}
            </CopyButton>
            <Button radius="sm" onClick={() => setGeneratedKey(null)}>
              Done
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
