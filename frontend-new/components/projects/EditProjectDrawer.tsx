'use client';

import {
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconCode, IconFolderPlus } from '@tabler/icons-react';
import { useEffect } from 'react';
import { useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { Project } from '@/types/project';

const FRAMEWORK_OPTIONS = [
  { value: 'node', label: 'Node' },
  { value: 'go', label: 'Go' },
  { value: 'dotnet', label: '.NET' },
];

interface EditProjectDrawerProps {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  project?: Project | null;
}

export default function EditProjectDrawer({
  opened,
  onClose,
  workspaceId,
  project,
}: EditProjectDrawerProps) {
  const isEditing = !!project;

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      framework: '',
    },
    validate: {
      name: (value) =>
        value.trim().length < 2
          ? 'Project name must be at least 2 characters'
          : null,
    },
  });

  useEffect(() => {
    if (!opened) return;

    if (project) {
      form.setValues({
        name: project.name,
        description: project.description ?? '',
        framework: project.framework ?? '',
      });
      return;
    }

    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, project]);

  const { mutateAsync: create, isPending: creating } =
    useCreateProject(workspaceId);
  const { mutateAsync: update, isPending: updating } =
    useUpdateProject(workspaceId);

  const isPending = creating || updating;

  const handleSubmit = form.onSubmit(async (values) => {
    const payload = {
      name: values.name.trim(),
      description: values.description.trim(),
      framework: values.framework.trim(),
    };

    try {
      if (isEditing && project) {
        await update({
          uuid: project.uuid,
          ...payload,
        });

        notifications.show({
          title: 'Project updated',
          message: `"${payload.name}" has been updated.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      } else {
        await create(payload);

        notifications.show({
          title: 'Project created',
          message: `"${payload.name}" has been created.`,
          color: 'teal',
          icon: <IconCheck size={16} />,
        });
      }

      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to save project';

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
            <IconFolderPlus size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size='lg' lh={1.2}>
              {isEditing ? 'Edit Project' : 'Create Project'}
            </Text>
            <Text size='sm' c='dimmed' mt={2}>
              {isEditing
                ? 'Update the project details below'
                : 'Add a new project to this workspace'}
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
            label='Project Name'
            placeholder='e.g. Marketing Site'
            description='A concise name your team will recognize'
            withAsterisk
            {...form.getInputProps('name')}
            radius='sm'
          />

          <Textarea
            label='Description'
            placeholder='What is this project responsible for?'
            description='Optional, but useful when the workspace grows'
            autosize
            minRows={3}
            maxRows={6}
            {...form.getInputProps('description')}
            radius='sm'
          />

          <Select
            label='Framework'
            placeholder='Select a framework'
            description='Choose one of the supported project runtimes'
            data={FRAMEWORK_OPTIONS}
            leftSection={<IconCode size={15} />}
            {...form.getInputProps('framework')}
            clearable
            searchable={false}
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
              {isEditing ? 'Save Changes' : 'Create Project'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Drawer>
  );
}
