'use client';

import { Box, Button, Center, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconPlus, IconServer } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface ServersPageProps {
  workspaceId: string;
}

export default function ServersPage({ workspaceId }: ServersPageProps) {
  const router = useRouter();

  return (
    <Stack gap="lg" p="md">
      <Box>
        <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
          Infrastructure
        </Text>
        <Text fw={700} size="xl">
          Servers / Services
        </Text>
      </Box>

      <Paper withBorder radius="md">
        <Center py={80}>
          <Stack align="center" gap="sm">
            <ThemeIcon size={52} radius="xl" variant="light" color="indigo">
              <IconServer size={24} />
            </ThemeIcon>
            <Text fw={600}>No server setup flow existed yet</Text>
            <Text size="sm" c="dimmed" ta="center" maw={520}>
              Start with the new service creation flow. It is organized as a
              full-page multi-step form and supports project-linked service
              setup.
            </Text>
            <Button
              mt="xs"
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push(`/app/${workspaceId}/servers/create`)}
            >
              Create Service
            </Button>
          </Stack>
        </Center>
      </Paper>
    </Stack>
  );
}
