'use client';

import {
  Button,
  Drawer,
  Stack,
  TextInput,
  Textarea,
  Text,
  Divider,
  Group,
  ThemeIcon,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconShield, IconCheck } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useCreateRole, useUpdateRole } from '@/hooks/useRoles';
import { Role } from '@/types/role';

interface EditRoleDrawerProps {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  role?: Role | null;
}

export default function EditRoleDrawer({
  opened,
  onClose,
  workspaceId,
  role,
}: EditRoleDrawerProps) {
  const isEditing = !!role;

  const form = useForm({
    initialValues: {
      role_name: '',
      description: '',
    },
    validate: {
      role_name: (v) =>
        v.trim().length < 2 ? 'Name must be at least 2 characters' : null,
    },
  });

  useEffect(() => {
    if (opened) {
      if (role) {
        form.setValues({
          role_name: role.role_name,
          description: role.description ?? '',
        });
      } else {
        form.reset();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, role]);

  const { mutateAsync: create, isPending: creating } =
    useCreateRole(workspaceId);
  const { mutateAsync: update, isPending: updating } =
    useUpdateRole(workspaceId);

  const isPending = creating || updating;

  const handleSubmit = form.onSubmit(async (values) => {
    try {
      if (isEditing && role) {
        await update({ ...role, ...values });
        notifications.show({
          title: 'Role updated',
          message: `"${values.role_name}" has been updated.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      } else {
        await create(values as Omit<Role, 'uuid' | 'created_at'>);
        notifications.show({
          title: 'Role created',
          message: `"${values.role_name}" has been created.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      notifications.show({ title: 'Error', message, color: 'red' });
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
        <Group gap='sm'>
          <ThemeIcon size='md' radius='sm' variant='light' color='indigo'>
            <IconShield size={16} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size='sm'>
              {isEditing ? 'Edit Role' : 'Create Role'}
            </Text>
            <Text size='xs' c='dimmed'>
              {isEditing
                ? 'Update the role details below'
                : 'Define a new role for your workspace'}
            </Text>
          </Box>
        </Group>
      }
      styles={{
        header: {
          borderBottom: '1px solid var(--mantine-color-default-border)',
          paddingBottom: 'var(--mantine-spacing-md)',
        },
        body: {
          paddingTop: 'var(--mantine-spacing-xl)',
        },
      }}>
      <form onSubmit={handleSubmit}>
        <Stack gap='lg'>
          <TextInput
            label='Role Name'
            placeholder='e.g. Developer, Viewer…'
            description='A short, clear name for this role'
            {...form.getInputProps('role_name')}
            radius='sm'
          />

          <Textarea
            label='Description'
            placeholder='Describe what this role can do…'
            description='Optional — helps team members understand the role'
            {...form.getInputProps('description')}
            autosize
            minRows={3}
            maxRows={6}
            radius='sm'
          />

          <Divider />

          <Group justify='flex-end' gap='sm'>
            <Button
              variant='default'
              radius='sm'
              onClick={onClose}
              disabled={isPending}>
              Cancel
            </Button>
            <Button
              type='submit'
              radius='sm'
              loading={isPending}
              leftSection={<IconCheck size={15} />}>
              {isEditing ? 'Save Changes' : 'Create Role'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
