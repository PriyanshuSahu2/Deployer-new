'use client';

import { Box, Button, Center, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconPlus, IconServer } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ServiceListProps {
  workspaceId: string;
  projectId: string;
}

export default function ServiceList({ workspaceId, projectId }: ServiceListProps) {
  const router = useRouter();

  return (
    <Stack gap="lg" p="md">
      <Paper withBorder radius="md">
        <Center py={80}>
          <Stack align="center" gap="sm">
            <ThemeIcon size={52} radius="xl" variant="light" color="indigo">
              <IconServer size={24} />
            </ThemeIcon>
            <Text fw={600}>No service exists</Text>
            <Text size="sm" c="dimmed" ta="center" maw={520}>
              Start with the new service creation flow. It is organized as a
              full-page multi-step form and supports project-linked service
              setup.
            </Text>
            <Button
              mt="xs"
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/create`)}
            >
              Create Service
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Stack>
  );
}
