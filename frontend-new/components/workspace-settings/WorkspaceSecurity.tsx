'use client';

import { Button, Group, Paper, SimpleGrid, Stack, Switch, TagsInput, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect } from 'react';
import { useUpdateWorkspaceSettings } from '@/hooks/useWorkspace';
import type {
  UpdateWorkspaceSettingsPayload,
  WorkspaceSettings,
} from '@/types/workspace-settings';

interface WorkspaceSecurityProps {
  workspaceId: string;
  settings: WorkspaceSettings;
}

export default function WorkspaceSecurity({
  workspaceId,
  settings,
}: WorkspaceSecurityProps) {
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
      await updateSettings(values);
      notifications.show({
        title: 'Security controls updated',
        message: 'Workspace invite restrictions have been saved.',
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to update security controls';
      notifications.show({ title: 'Error', message, color: 'red' });
    }
  });

  return (
    <Paper withBorder radius="sm" p="md">
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          <Stack gap={4}>
            <Text fw={700}>Security Controls</Text>
            <Text size="sm" c="dimmed">
              Workspace-level controls for invites and account requirements.
            </Text>
          </Stack>

          <TagsInput
            label="Allowed email domains"
            placeholder="company.com"
            description="Add domains without the @ symbol"
            radius="sm"
            disabled={!settings.isOwner}
            {...form.getInputProps('allowedEmailDomains')}
          />

          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
            <Switch
              label="Enforce invite restrictions"
              description="Only allow invites for configured domains"
              disabled={!settings.isOwner}
              {...form.getInputProps('enforceInviteRestrictions', {
                type: 'checkbox',
              })}
            />
            <Switch
              label="Require 2FA"
              description="Future-ready policy flag"
              disabled={!settings.isOwner}
              {...form.getInputProps('requireTwoFactor', { type: 'checkbox' })}
            />
          </SimpleGrid>

          {settings.isOwner && (
            <Group justify="flex-end">
              <Button type="submit" radius="sm" loading={isPending}>
                Save Security
              </Button>
            </Group>
          )}
        </Stack>
      </form>
    </Paper>
  );
}
