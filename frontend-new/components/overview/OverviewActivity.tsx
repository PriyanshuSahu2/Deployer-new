'use client';

import { Badge, Group, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconHistory,
  IconRocket,
  IconX,
} from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type React from 'react';
import type { OverviewActivity } from '@/types/overview';

dayjs.extend(relativeTime);

interface OverviewActivityProps {
  activities?: OverviewActivity[];
  isLoading: boolean;
}

const statusColor: Record<string, string> = {
  success: 'green',
  failed: 'red',
  deploying: 'blue',
  pending: 'yellow',
};

const statusIcon: Record<string, React.ReactNode> = {
  success: <IconCheck size={12} />,
  failed: <IconX size={12} />,
  deploying: <IconRocket size={12} />,
  pending: <IconClock size={12} />,
};

function statusText(status: string) {
  switch (status.toLowerCase()) {
    case 'success':
      return 'Deployed';
    case 'failed':
      return 'Failed';
    case 'deploying':
      return 'Deploying';
    case 'pending':
      return 'Queued';
    default:
      return status;
  }
}

export default function OverviewActivity({ activities = [], isLoading }: OverviewActivityProps) {
  return (
    <Paper p="md" radius="sm" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={700}>Recent Activity</Text>
        <Text size="xs" c="dimmed">
          Last 10 items
        </Text>
      </Group>

      <Stack gap="xs">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={38} radius="sm" />
          ))}

        {!isLoading && activities.length === 0 && (
          <Group gap="sm" py="xs">
            <ThemeIcon color="gray" variant="light" radius="md">
              <IconHistory size={18} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              No recent deployment activity.
            </Text>
          </Group>
        )}

        {!isLoading &&
          activities.map((activity) => {
            const normalized = activity.status.toLowerCase();

            return (
              <Group key={`${activity.type}-${activity.id}`} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap">
                  <ThemeIcon
                    color={statusColor[normalized] ?? 'gray'}
                    variant="light"
                    radius="md"
                    size="md"
                  >
                    {statusIcon[normalized] ?? <IconClock size={12} />}
                  </ThemeIcon>
                  <Stack gap={0}>
                    <Text size="sm" fw={500}>
                      {activity.title}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {dayjs(activity.createdAt).fromNow()}
                    </Text>
                  </Stack>
                </Group>
                <Badge color={statusColor[normalized] ?? 'gray'} variant="light">
                  {statusText(activity.status)}
                </Badge>
              </Group>
            );
          })}
      </Stack>
    </Paper>
  );
}
