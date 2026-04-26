'use client';

import {
  Alert,
  Button,
  Group,
  Modal,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useTransferWorkspaceOwnership } from '@/hooks/useWorkspace';
import type { WorkspaceSettings } from '@/types/workspace-settings';

interface WorkspaceOwnershipProps {
  workspaceId: string;
  settings: WorkspaceSettings;
}

export default function WorkspaceOwnership({
  workspaceId,
  settings,
}: WorkspaceOwnershipProps) {
  const [newOwnerId, setNewOwnerId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { mutateAsync: transferOwnership, isPending } =
    useTransferWorkspaceOwnership(workspaceId);

  const ownerOptions = useMemo(
    () =>
      settings.members
        .filter((member) => member.userUuid !== settings.ownerUserUuid)
        .map((member) => ({
          value: member.userUuid,
          label: `${member.name} (${member.email})`,
        })),
    [settings.members, settings.ownerUserUuid],
  );

  if (!settings.isOwner) {
    return null;
  }

  const selectedMember = settings.members.find(
    (member) => member.userUuid === newOwnerId,
  );

  const handleTransfer = async () => {
    if (!newOwnerId) return;

    try {
      await transferOwnership(newOwnerId);
      notifications.show({
        title: 'Ownership transferred',
        message: 'The selected member is now the workspace owner.',
        color: 'teal',
      });
      setConfirmOpen(false);
      setNewOwnerId(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to transfer ownership';
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  };

  return (
    <>
      <Paper withBorder radius="sm" p="md">
        <Stack gap="lg">
          <Stack gap={4}>
            <Text fw={700}>Transfer Ownership</Text>
            <Text size="sm" c="dimmed">
              Move owner permissions to another active workspace member.
            </Text>
          </Stack>

          <Alert
            color="red"
            variant="light"
            radius="sm"
            icon={<IconAlertTriangle size={16} />}
          >
            Ownership transfer changes the workspace owner immediately. Your role
            will be downgraded to Manager.
          </Alert>

          <Group align="flex-end">
            <Select
              label="New owner"
              placeholder="Select a workspace member"
              data={ownerOptions}
              value={newOwnerId}
              onChange={setNewOwnerId}
              radius="sm"
              searchable
              style={{ flex: 1 }}
            />
            <Button
              color="red"
              radius="sm"
              disabled={!newOwnerId}
              onClick={() => setConfirmOpen(true)}
            >
              Transfer Ownership
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Modal
        opened={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm ownership transfer"
        radius="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Transfer ownership to{' '}
            <Text span fw={700}>
              {selectedMember?.name}
            </Text>
            ? This action changes owner permissions immediately.
          </Text>
          <Group justify="flex-end">
            <Button
              variant="default"
              radius="sm"
              onClick={() => setConfirmOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              color="red"
              radius="sm"
              loading={isPending}
              onClick={handleTransfer}
            >
              Confirm Transfer
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
