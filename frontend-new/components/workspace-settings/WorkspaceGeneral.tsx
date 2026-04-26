'use client';

import {
  Button,
  Group,
  NumberInput,
  Paper,
  SimpleGrid,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useUpdateWorkspaceSettings } from '@/hooks/useWorkspace';
import type {
  UpdateWorkspaceSettingsPayload,
  WorkspaceSettings,
} from '@/types/workspace-settings';

interface WorkspaceGeneralProps {
  workspaceId: string;
  settings: WorkspaceSettings;
}

export default function WorkspaceGeneral({
  workspaceId,
  settings,
}: WorkspaceGeneralProps) {
  const { mutateAsync: updateSettings, isPending } =
    useUpdateWorkspaceSettings(workspaceId);

  const form = useForm<UpdateWorkspaceSettingsPayload>({
    initialValues: {
      name: settings.name,
      defaultBranch: settings.defaultBranch,
      autoDeployDefault: settings.autoDeployDefault,
      defaultEnvironmentName: settings.defaultEnvironmentName,
      deploymentTimeoutSeconds: settings.deploymentTimeoutSeconds,
      allowedEmailDomains: settings.allowedEmailDomains,
      enforceInviteRestrictions: settings.enforceInviteRestrictions,
      requireTwoFactor: settings.requireTwoFactor,
      enablePreviewDeployments: settings.enablePreviewDeployments,
      enableExperimentalFeatures: settings.enableExperimentalFeatures,
    },
    validate: {
      name: (value) =>
        value.trim().length < 3 ? 'Workspace name must be at least 3 characters' : null,
      defaultBranch: (value) =>
        value.trim().length === 0 ? 'Default branch is required' : null,
    },
  });

  useEffect(() => {
    form.setValues({
      name: settings.name,
      defaultBranch: settings.defaultBranch,
      autoDeployDefault: settings.autoDeployDefault,
      defaultEnvironmentName: settings.defaultEnvironmentName,
      deploymentTimeoutSeconds: settings.deploymentTimeoutSeconds,
      allowedEmailDomains: settings.allowedEmailDomains,
      enforceInviteRestrictions: settings.enforceInviteRestrictions,
      requireTwoFactor: settings.requireTwoFactor,
      enablePreviewDeployments: settings.enablePreviewDeployments,
      enableExperimentalFeatures: settings.enableExperimentalFeatures,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.uuid]);

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      await updateSettings({
        ...values,
        name: values.name.trim(),
        defaultBranch: values.defaultBranch.trim(),
        defaultEnvironmentName: values.defaultEnvironmentName.trim(),
      });

      notifications.show({
        title: 'Workspace updated',
        message: 'Workspace defaults have been saved.',
        color: 'teal',
        icon: <IconCheck size={16} />,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update workspace';
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  });

  return (
    <Paper withBorder radius="sm" p="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack gap={4}>
            <Text fw={700}>Workspace Identity</Text>
            <Text size="sm" c="dimmed">
              Basic workspace details used across the dashboard.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <TextInput
              label="Workspace Name"
              placeholder="My Company"
              radius="sm"
              withAsterisk
              disabled={!settings.isOwner}
              {...form.getInputProps('name')}
            />
          </SimpleGrid>

          <Stack gap={4}>
            <Text fw={700}>Global Defaults</Text>
            <Text size="sm" c="dimmed">
              Defaults applied to new workspace-level deployment flows.
            </Text>
          </Stack>

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <TextInput
              label="Default Branch"
              placeholder="main"
              radius="sm"
              disabled={!settings.isOwner}
              {...form.getInputProps('defaultBranch')}
            />
            <TextInput
              label="Default Environment Name"
              placeholder="production"
              radius="sm"
              disabled={!settings.isOwner}
              {...form.getInputProps('defaultEnvironmentName')}
            />
            <NumberInput
              label="Deployment Timeout"
              description="Seconds"
              min={30}
              max={3600}
              radius="sm"
              disabled={!settings.isOwner}
              {...form.getInputProps('deploymentTimeoutSeconds')}
            />
            <Switch
              label="Auto-deploy by default"
              description="Enable automatic deployments for new services when supported"
              disabled={!settings.isOwner}
              {...form.getInputProps('autoDeployDefault', { type: 'checkbox' })}
            />
          </SimpleGrid>

          <Stack gap="sm">
            <Text fw={700}>Feature Flags</Text>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Switch
                label="Enable preview deployments"
                disabled={!settings.isOwner}
                {...form.getInputProps('enablePreviewDeployments', {
                  type: 'checkbox',
                })}
              />
              <Switch
                label="Enable experimental features"
                disabled={!settings.isOwner}
                {...form.getInputProps('enableExperimentalFeatures', {
                  type: 'checkbox',
                })}
              />
            </SimpleGrid>
          </Stack>

          {settings.isOwner && (
            <Group justify="flex-end">
              <Button type="submit" radius="sm" loading={isPending}>
                Save Changes
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
