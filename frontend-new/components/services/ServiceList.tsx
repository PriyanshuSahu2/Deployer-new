'use client';

import { Button, Center, Paper, Stack, Text, ThemeIcon, Table, Group, Badge, ActionIcon, Skeleton, Tooltip, Loader } from '@mantine/core';
import { IconPlus, IconServer, IconExternalLink, IconSettings, IconPlayerPlay, IconClock, IconCheck, IconX, IconPencil } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useGetServices, useTriggerDeployment } from '@/hooks/useServices';
import { notifications } from '@mantine/notifications';
import type { Service } from '@/types/service';

interface ServiceListProps {
  workspaceId: string;
  projectId?: string;
  environmentId?: string;
}

export default function ServiceList({ workspaceId, projectId, environmentId }: ServiceListProps) {
  const router = useRouter();

  const { data: servicesResponse, isLoading } = useGetServices(workspaceId, projectId ?? '', !!projectId);
  const { mutateAsync: triggerDeployAsync, isPending: isDeploying } = useTriggerDeployment(workspaceId, projectId ?? '');

  const handleDeploy = async (serviceUUID: string, serviceName: string) => {
    try {
      await triggerDeployAsync(serviceUUID);
      notifications.show({
        title: 'Deploy Triggered',
        message: `Deployment triggered for service ${serviceName}`,
        color: 'teal',
      });
    } catch (err: unknown) {
      type AxiosLike = { response?: { data?: { error?: string } }; message?: string };
      const axiosErr = err as AxiosLike;
      notifications.show({
        title: 'Deploy Failed',
        message: axiosErr?.response?.data?.error || axiosErr?.message || 'Failed to trigger deployment',
        color: 'red',
      });
    }
  };

  const services: Service[] = Array.isArray(servicesResponse) ? servicesResponse : ((servicesResponse as { data?: Service[] })?.data ?? []);

  const filteredServices = services.filter((s: Service) => !environmentId || (s as Service & { environmentUuid?: string }).environmentUuid === environmentId);

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
            {filteredServices.map((service) => (
              <Table.Tr key={service.uuid}>
                <Table.Td>
                  <Text fw={500}>{service.name}</Text>
                </Table.Td>
                <Table.Td>
                  <Badge color="blue" variant="light">{service.type}</Badge>
                </Table.Td>
                <Table.Td>{service.framework}</Table.Td>
                <Table.Td>
                  {(() => {
                    const status = service.status?.toLowerCase();
                    switch (status) {
                      case 'pending':
                        return <Badge color="yellow" variant="light" leftSection={<IconClock size={12} />}>Queued</Badge>;
                      case 'deploying':
                        return <Badge color="blue" variant="light" leftSection={<Loader size={10} />}>Deploying</Badge>;
                      case 'success':
                        return <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>Deployed</Badge>;
                      case 'failed':
                        return <Badge color="red" variant="light" leftSection={<IconX size={12} />}>Failed</Badge>;
                      default:
                        return <Badge color="green">Active</Badge>;
                    }
                  })()}
                </Table.Td>
                <Table.Td>{service.createdAt}</Table.Td>
                <Table.Td>
                  <Group gap="xs" justify="flex-end">
                    <Tooltip label={ (service.status === 'pending' || service.status === 'deploying') ? "Deployment in progress" : "Deploy Now" }>
                      <ActionIcon
                        variant="light"
                        color="teal"
                        title="Deploy"
                        loading={isDeploying}
                        disabled={service.status === 'pending' || service.status === 'deploying'}
                        onClick={() => handleDeploy(service.uuid, service.name)}
                      >
                        <IconPlayerPlay size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <ActionIcon
                      variant="light"
                      color="blue"
                      title="Edit Service"
                      onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/${service.uuid}/edit`)}
                    >
                      <IconPencil size={16} />
                    </ActionIcon>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      title="Open Service"
                      onClick={() => router.push(`/app/${workspaceId}/projects/${projectId}/services/${service.uuid}`)}
                    >
                      <IconExternalLink size={16} />
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
