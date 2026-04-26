'use client';

import {
  Button,
  Center,
  Group,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconGitBranch,
  IconPlus,
  IconRefresh,
  IconRocket,
  IconServerBolt,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useOverview } from '@/hooks/useOverview';
import OverviewActivity from './OverviewActivity';
import OverviewAlerts from './OverviewAlerts';
import OverviewStats from './OverviewStats';

interface OverviewPageClientProps {
  workspaceId: string;
}

export default function OverviewPageClient({ workspaceId }: OverviewPageClientProps) {
  const router = useRouter();
  const { data: overview, isError, isLoading, refetch, isFetching } = useOverview(workspaceId);

  if (isError) {
    return (
      <Center h="100vh">
        <Stack align="center" gap="sm">
          <Text c="red" fw={600}>
            Failed to load workspace overview.
          </Text>
          <Button
            radius="sm"
            variant="light"
            leftSection={<IconRefresh size={16} />}
            loading={isFetching}
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </Stack>
      </Center>
    );
  }

  const cpu = overview?.systemLoad.cpu ?? 0;
  const memory = overview?.systemLoad.memory ?? 0;
  const runningServices = overview?.systemLoad.runningServices ?? 0;

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="flex-end">
        <Stack gap={4}>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500}>
            Workspace
          </Text>
          <Text fw={700} size="xl">
            Overview
          </Text>
        </Stack>

        <Group gap="xs">
          <Button
            radius="sm"
            size="sm"
            variant="light"
            leftSection={<IconRefresh size={15} />}
            loading={isFetching && !isLoading}
            onClick={() => refetch()}
          >
            Refresh
          </Button>
        </Group>
      </Group>

      <OverviewStats overview={overview} isLoading={isLoading} />

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <OverviewAlerts alerts={overview?.alerts} isLoading={isLoading} />
        <OverviewActivity activities={overview?.activities} isLoading={isLoading} />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
        <Paper p="md" radius="sm" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={700}>System Load Snapshot</Text>
            <ThemeIcon color="indigo" variant="light" radius="md">
              <IconServerBolt size={18} />
            </ThemeIcon>
          </Group>

          <Stack gap="md">
            <Stack gap={6}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  CPU usage
                </Text>
                <Text size="sm" c="dimmed">
                  {cpu}%
                </Text>
              </Group>
              <Progress value={cpu} radius="sm" color="indigo" />
            </Stack>

            <Stack gap={6}>
              <Group justify="space-between">
                <Text size="sm" fw={500}>
                  Memory usage
                </Text>
                <Text size="sm" c="dimmed">
                  {memory}%
                </Text>
              </Group>
              <Progress value={memory} radius="sm" color="teal" />
            </Stack>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                Running services
              </Text>
              <Text fw={700}>{runningServices}</Text>
            </Group>
          </Stack>
        </Paper>

        <Paper p="md" radius="sm" withBorder>
          <Text fw={700} mb="md">
            Quick Actions
          </Text>

          <Stack gap="sm">
            <Button
              radius="sm"
              justify="flex-start"
              leftSection={<IconPlus size={16} />}
              onClick={() => router.push(`/app/${workspaceId}/projects`)}
            >
              Create Project
            </Button>
            <Button
              radius="sm"
              variant="light"
              justify="flex-start"
              leftSection={<IconRocket size={16} />}
              onClick={() => router.push(`/app/${workspaceId}/projects`)}
            >
              Trigger Deployment
            </Button>
            <Button
              radius="sm"
              variant="light"
              justify="flex-start"
              leftSection={<IconGitBranch size={16} />}
              onClick={() => router.push(`/app/${workspaceId}/integrations`)}
            >
              Connect Repository
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
}
