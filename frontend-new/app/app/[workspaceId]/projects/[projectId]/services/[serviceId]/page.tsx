"use client"
import { useParams } from 'next/navigation';
import { useGetServiceLogs, useTriggerDeployment, useToggleAutoDeploy, useGetServiceDetails } from '@/hooks/useServices';
import { Card, Text, Group, ScrollArea, Loader, ThemeIcon, Button, Badge, Skeleton, Paper, CopyButton, ActionIcon, Tooltip, Stack, Switch } from '@mantine/core';
import { useEffect, useRef } from 'react';
import { IconTerminal2, IconPlayerPlay, IconServer, IconCopy, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

const parseAnsi = (text: string) => {
  const ansiRegex = /\033\[([0-9;]*)m/g;
  const parts = text.split(ansiRegex);

  const elements = [];
  let currentColor = '#e5e7eb'; // default terminal text color
  let currentBg = 'transparent';
  let isBold = false;

  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      if (parts[i]) {
        elements.push(
          <span key={i} style={{ color: currentColor, backgroundColor: currentBg, fontWeight: isBold ? 'bold' : 'normal' }}>
            {parts[i]}
          </span>
        );
      }
    } else {
      const codeStr = parts[i];
      const codes = codeStr.split(';');
      for (const code of codes) {
        if (code === '0' || code === '') {
          currentColor = '#e5e7eb';
          currentBg = 'transparent';
          isBold = false;
        } else if (code === '1') {
          isBold = true;
        } else if (code === '31') currentColor = '#ef4444'; // red
        else if (code === '32') currentColor = '#22c55e'; // green
        else if (code === '33') currentColor = '#eab308'; // yellow
        else if (code === '34') currentColor = '#3b82f6'; // blue
        else if (code === '35') currentColor = '#d946ef'; // magenta
        else if (code === '36') currentColor = '#06b6d4'; // cyan
        else if (code === '37') currentColor = '#f3f4f6'; // white
        else if (code === '90') currentColor = '#9ca3af'; // gray
      }
    }
  }
  return elements;
};

export default function ServiceDetailsPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  const serviceId = params.serviceId as string;

  const { data, isLoading, isError } = useGetServiceLogs(workspaceId, projectId, serviceId);
  const { data: serviceDetailsResponse, isLoading: servicesLoading } = useGetServiceDetails(workspaceId, projectId, serviceId);
  const service = (serviceDetailsResponse as any)?.data ?? serviceDetailsResponse;

  const { mutateAsync: triggerDeployAsync, isPending: isDeploying } = useTriggerDeployment(workspaceId, projectId);
  const { mutateAsync: toggleAutoDeployAsync, isPending: isTogglingAutoDeploy } = useToggleAutoDeploy(workspaceId, projectId);

  const handleDeploy = async () => {
    try {
      await triggerDeployAsync(serviceId);
      notifications.show({
        title: 'Deploy Triggered',
        message: `Deployment triggered for service ${service?.name || serviceId}`,
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

  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [data?.data.logs]);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
      <Group justify="space-between" mb="lg">
        <Group>
          <ThemeIcon size="lg" radius="md" variant="light" color="blue">
            <IconTerminal2 size={24} />
          </ThemeIcon>
          <div>
            <Text size="xl" fw={700}>Service Details</Text>
            {service ? (
              <Group gap="xs" mt={2}>
                <Text fw={500} size="sm">{service.name}</Text>
                <Badge color="blue" variant="light" size="sm">{service.type}</Badge>
                <Badge color="violet" variant="light" size="sm">{service.framework}</Badge>
                <Badge color="green" size="sm">Active</Badge>
              </Group>
            ) : (
              <Text c="dimmed" size="sm">Console logs and details for {serviceId}</Text>
            )}
          </div>
        </Group>

        <Button
          leftSection={<IconPlayerPlay size={16} />}
          color="teal"
          onClick={handleDeploy}
          loading={isDeploying}
        >
          Deploy Now
        </Button>
      </Group>

      {servicesLoading ? (
        <Skeleton height={80} radius="md" mb="xl" />
      ) : service ? (
        <Paper withBorder p="md" radius="md" mb="xl" shadow="sm">
          <Stack gap="md">
            <Group grow align="flex-start">
              <div>
                <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Domain</Text>
                <Text size="sm" mt={4}>{service.domain || 'Not configured'}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Build Type</Text>
                <Text size="sm" mt={4}>{service.framework} ({service.dockerizeType})</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Deployment Path</Text>
                <Text size="sm" mt={4} style={{ fontFamily: 'monospace' }}>{service.deployPath || '/'}</Text>
              </div>
              <div>
                <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Created At</Text>
                <Text size="sm" mt={4}>{service.createdAt}</Text>
              </div>
            </Group>

            {service.git && (
              <Group grow align="flex-start" mt="sm">
                <div>
                  <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Repository</Text>
                  <Text size="sm" mt={4}>{service.git.repositoryUrl}</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Branch</Text>
                  <Text size="sm" mt={4}>{service.git.branch}</Text>
                </div>
                <div>
                  <Text size="xs" color="dimmed" tt="uppercase" fw={700}>Auto Deploy</Text>
                  <Switch
                    mt={6}
                    checked={service.git?.autoDeploy ?? false}
                    disabled={isTogglingAutoDeploy}
                    label={service.git?.autoDeploy ? 'Enabled' : 'Disabled'}
                    onChange={(e) =>
                      toggleAutoDeployAsync({ serviceUUID: serviceId, enabled: e.currentTarget.checked })
                    }
                  />
                </div>
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>Webhook URL</Text>
                  <Group gap="xs" mt={4}>
                    <Text size="sm" style={{ fontFamily: 'monospace' }} truncate maw={180}>
                      /api/webhooks/github
                    </Text>
                    <CopyButton value={`${window.location.origin}/api/webhooks/github`} timeout={2000}>
                      {({ copied, copy }) => (
                        <Tooltip label={copied ? 'Copied' : 'Copy'} withArrow position="right">
                          <ActionIcon color={copied ? 'teal' : 'gray'} variant="subtle" onClick={copy}>
                            {copied ? (
                              <IconCheck size={16} />
                            ) : (
                              <IconCopy size={16} />
                            )}
                          </ActionIcon>
                        </Tooltip>
                      )}
                    </CopyButton>
                  </Group>
                </div>
              </Group>
            )}
          </Stack>
        </Paper>
      ) : null}

      <Card shadow="sm" p="0" radius="md" withBorder style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eab308' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22c55e' }} />
          <Text size="xs" c="dimmed" ml="sm" style={{ fontFamily: 'monospace' }}>bash - deployer</Text>
        </div>

        <ScrollArea h={600} viewportRef={viewportRef} style={{ padding: '16px' }}>
          {isLoading && (
            <Group py="xl">
              <Loader size="sm" variant="dots" color="gray" />
              <Text c="dimmed" size="sm" style={{ fontFamily: 'monospace' }}>Connecting to log stream...</Text>
            </Group>
          )}

          {isError && (
            <Text c="red" size="sm" style={{ fontFamily: 'monospace' }}>Failed to load deployment logs. The log file may not exist yet or the server is unreachable.</Text>
          )}

          {data && !data.data.logs && (
            <Text c="dimmed" size="sm" style={{ fontFamily: 'monospace' }}>Waiting for deployment to start...</Text>
          )}

          {data?.data.logs && (
            <pre style={{
              margin: 0,
              fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, Courier, monospace',
              fontSize: '13px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              color: '#e5e7eb'
            }}>
              {parseAnsi(data.data.logs)}
            </pre>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
