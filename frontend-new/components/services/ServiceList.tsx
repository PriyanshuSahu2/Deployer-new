'use client';

import { Box, Button, Center, Paper, Stack, Text, ThemeIcon, Table, Group, Badge, ActionIcon, Skeleton } from '@mantine/core';
import { IconPlus, IconServer, IconExternalLink, IconSettings, IconPlayerPlay } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useGetServices, useTriggerDeployment } from '@/hooks/useServices';
import { notifications } from '@mantine/notifications';

interface ServiceListProps {
  workspaceId: string;
  projectId: string;
  environmentId: string;
}

export default function ServiceList({ workspaceId, projectId, environmentId }: ServiceListProps) {
  const router = useRouter();

  const { data: servicesResponse, isLoading } = useGetServices(workspaceId, projectId);
  const { mutateAsync: triggerDeployAsync, isPending: isDeploying } = useTriggerDeployment(workspaceId, projectId);

  const handleDeploy = async (serviceUUID: string, serviceName: string) => {
    try {
      await triggerDeployAsync(serviceUUID);
      notifications.show({
        title: 'Deploy Triggered',
        message: `Deployment triggered for service ${serviceName}`,
        color: 'teal',
      });
    } catch (err: any) {
      notifications.show({
        title: 'Deploy Failed',
        message: err?.response?.data?.error || err.message || 'Failed to trigger deployment',
        color: 'red',
      });
    }
  };

  const services = Array.isArray(servicesResponse) ? servicesResponse : (servicesResponse as any)?.data || [];

  const filteredServices = services.filter((s: any) => !environmentId || s.environmentUuid === environmentId);

  if (isLoading) {
    return (
      <Stack gap="lg" p="md">
        <Skeleton height={50} radius="md" />
        <Skeleton height={50} radius="md" />
        <Skeleton height={50} radius="md" />
      </Stack>
    );
  }

  if (filteredServices.length === 0) {
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
                onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/create?environmentId=${environmentId}`)}
              >
                Create Service
              </Button>
            </Stack>
          </Center>
        </Paper>
      </Stack>
    );
  }

  return (
    <Stack gap="lg" p="md">
      <Group justify="flex-end">
        <Button
          leftSection={<IconPlus size={16} />}
          onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/create?environmentId=${environmentId}`)}
        >
          Create Service
        </Button>
      </Group>
      <Paper withBorder radius="md">
        <Table verticalSpacing="sm" highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Name</Table.Th>
              <Table.Th>Type</Table.Th>
              <Table.Th>Framework</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Created At</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {filteredServices.map((service: any) => (
              <Table.Tr key={service.uuid}>
                <Table.Td>
                  <Text fw={500}>{service.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="blue" variant="light">{service.type}</Badge>
                </Table.Td>
                <Table.Td>{service.framework}</Table.Td>
                <Table.Td>
                  <Badge color="green">Active</Badge>
                </Table.Td>
                <Table.Td>{service.createdAt}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <ActionIcon
                      variant="light"
                      color="teal"
                      title="Deploy"
                      loading={isDeploying}
                      onClick={() => handleDeploy(service.uuid, service.name)}
                    >
                      <IconPlayerPlay size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      title="Open Deployment"
                      onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/${service.uuid}`)}
                    >
                      <IconExternalLink size={16} />
                    </ActionIcon>
                    <ActionIcon variant="light" color="gray" title="Settings">
                      <IconSettings size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    </Stack>
  );
}
