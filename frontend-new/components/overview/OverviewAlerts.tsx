'use client';

import { Alert, Badge, Group, Paper, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { OverviewAlert } from '@/types/overview';

dayjs.extend(relativeTime);

interface OverviewAlertsProps {
  alerts?: OverviewAlert[];
  isLoading: boolean;
}

const typeLabel: Record<string, string> = {
  failed_deployment: 'Deployment',
  service_down: 'Service',
  build_failure: 'Build',
};

export default function OverviewAlerts({ alerts = [], isLoading }: OverviewAlertsProps) {
  return (
    <Paper p="md" radius="sm" withBorder>
      <Group justify="space-between" mb="md">
        <Text fw={700}>Critical Alerts</Text>
        <Badge color={alerts.length ? 'red' : 'gray'} variant="light">
          {alerts.length}
        </Badge>
      </Group>

      <Stack gap="sm">
        {isLoading &&
          Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={54} radius="sm" />
          ))}

        {!isLoading && alerts.length === 0 && (
          <Group gap="sm" py="xs">
            <ThemeIcon color="teal" variant="light" radius="md">
              <IconCircleCheck size={18} />
            </ThemeIcon>
            <Text size="sm" c="dimmed">
              No critical alerts in this workspace.
            </Text>
          </Group>
        )}

        {!isLoading &&
          alerts.map((alert) => (
            <Alert
              key={`${alert.type}-${alert.id}`}
              color="red"
              variant="light"
              radius="sm"
              icon={<IconAlertTriangle size={16} />}
            >
              <Group justify="space-between" align="flex-start" gap="sm">
                <Stack gap={2}>
                  <Group gap="xs">
                    <Text size="sm" fw={600}>
                      {alert.title}
                    </Text>
                    <Badge size="xs" color="red" variant="outline">
                      {typeLabel[alert.type] ?? alert.type}
                    </Badge>
                  </Group>
                  <Text size="sm">{alert.message}</Text>
                </Stack>
                <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                  {dayjs(alert.createdAt).fromNow()}
                </Text>
              </Group>
            </Alert>
          ))}
      </Stack>
    </Paper>
  );
}
