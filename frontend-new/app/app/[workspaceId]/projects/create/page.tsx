'use client';

import {
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Paper,
  Title,
  Text,
  Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconFolderPlus } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useCreateProject } from '@/hooks/useProjects';
import { useParams, useRouter } from 'next/navigation';

export default function CreateProject() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = params.workspaceId as string;

  const { mutateAsync: createProject, isPending } =
    useCreateProject(workspaceId);

  const form = useForm({
    initialValues: {
      name: '',
      description: '',
      repository: '',
    },

    validate: {
      name: (value) =>
        value.length < 2 ? 'Project name must be at least 2 characters' : null,

      repository: (value) =>
        value && !value.startsWith('http')
          ? 'Repository must be a valid URL'
          : null,
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await createProject(values);

      notifications.show({
        title: 'Project created',
        message: `"${values.name}" has been created successfully.`,
        color: 'teal',
      });

      router.back();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to create project';

      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  return (
    <Stack p="md" gap="lg" maw={520}>
      <Box>
        <Title order={2}>Create Project</Title>

        <Text size="sm" c="dimmed" mt={4}>
          Create a new project inside this workspace
        </Text>
      </Box>

      <Paper withBorder p="lg" radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Project Name"
              placeholder="My App"
              withAsterisk
              leftSection={<IconFolderPlus size={16} />}
              {...form.getInputProps('name')}
            />

            <Textarea
              label="Description"
              placeholder="Short description about this project"
              autosize
              minRows={3}
              {...form.getInputProps('description')}
            />

            <TextInput
              label="Repository URL"
              placeholder="https://github.com/user/repo"
              {...form.getInputProps('repository')}
            />

            <Group justify="flex-end" mt="sm">
              <Button
                variant="subtle"
                onClick={() => router.back()}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                loading={isPending}
              >
                Create Project
              </Button>
            </Group>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}