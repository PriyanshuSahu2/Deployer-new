'use client';

import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconClock,
  IconFolders,
  IconServerBolt,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { WorkspaceOverview } from '@/types/overview';

dayjs.extend(relativeTime);

interface OverviewStatsProps {
  overview?: WorkspaceOverview;
  isLoading: boolean;
}

export default function OverviewStats({ overview, isLoading }: OverviewStatsProps) {
  const stats = [
    {
      title: 'Active Services',
      value: overview?.activeServices ?? 0,
      helper: `${overview?.totalServices ?? 0} total services`,
      icon: IconServerBolt,
      color: 'indigo',
    },
    {
      title: 'Workspace Inventory',
      value: `${overview?.totalProjects ?? 0} projects`,
      helper: `${overview?.totalServices ?? 0} services in this workspace`,
      icon: IconFolders,
      color: 'blue',
    },
    {
      title: 'Active Alerts',
      value: overview?.activeAlerts ?? 0,
      helper: 'Critical workspace signals',
      icon: IconAlertTriangle,
      color: overview?.activeAlerts ? 'red' : 'gray',
    },
    {
      title: 'Last Deployment',
      value: overview?.lastDeployment ? dayjs(overview.lastDeployment).fromNow() : 'None',
      helper: overview?.lastDeployment
        ? dayjs(overview.lastDeployment).format('MMM D, YYYY h:mm A')
        : 'No deployments yet',
      icon: IconClock,
      color: 'blue',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
      {stats.map((stat) => (
        <Paper key={stat.title} p="md" radius="sm" withBorder>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" fw={700} tt="uppercase">
                {stat.title}
              </Text>
              {isLoading ? (
                <Skeleton height={28} width={92} radius="sm" />
              ) : (
                <Text fw={700} size="xl">
                  {stat.value}
                </Text>
              )}
              <Text size="xs" c="dimmed">
                {stat.helper}
              </Text>
            </Stack>
            <ThemeIcon color={stat.color} variant="light" size="lg" radius="md">
              <stat.icon size={20} />
            </ThemeIcon>
          </Group>
        </Paper>
      ))}
    </SimpleGrid>
  );
}
