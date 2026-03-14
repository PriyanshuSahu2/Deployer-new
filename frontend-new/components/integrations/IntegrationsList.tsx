'use client';

import {
  Stack,
  Group,
  Text,
  Box,
  Button,
  SimpleGrid,
  Badge,
  ThemeIcon,
  Card,
} from '@mantine/core';
import {
  IconBrandGithub,
  IconBrandGitlab,
  IconBrandBitbucket,
  IconCheck,
  IconPlugConnected,
} from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useGetIntegrations, useGetGithubAuthUrl, useDisconnectIntegration } from '@/hooks/useIntegrations';

interface Props {
  workspaceId: string;
}

const INTEGRATION_OPTIONS = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Connect to GitHub to automatically deploy your repositories and enable CI/CD pipelines.',
    icon: IconBrandGithub,
    color: 'blue',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    description: 'Connect to GitLab to access your projects and set up automated deployments.',
    icon: IconBrandGitlab,
    color: 'orange',
  },
  {
    id: 'bitbucket',
    name: 'Bitbucket',
    description: 'Connect your Bitbucket repositories seamlessly to manage and deploy your code.',
    icon: IconBrandBitbucket,
    color: 'blue',
  },
];

export default function IntegrationsList({ workspaceId }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const { data: integrations = [], isLoading: isLoadingIntegrations } = useGetIntegrations(workspaceId);
  const { data: githubAuthUrl } = useGetGithubAuthUrl(workspaceId);
  const { mutateAsync: disconnectIntegration } = useDisconnectIntegration(workspaceId);
  
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');

    if (success === 'true') {
      notifications.show({
        title: 'Integration connected',
        message: 'Successfully connected integration to workspace.',
        color: 'teal',
      });
      router.replace(`/app/${workspaceId}/integrations`);
    } else if (error) {
      notifications.show({
        title: 'Integration failed',
        message: error,
        color: 'red',
      });
      router.replace(`/app/${workspaceId}/integrations`);
    }
  }, [searchParams, router, workspaceId]);

  const handleConnect = (id: string) => {
    if (id === 'github' && githubAuthUrl) {
      setLoading((prev) => ({ ...prev, [id]: true }));
      window.location.href = githubAuthUrl;
    } else {
      notifications.show({
        title: 'Not Implemented',
        message: `${id} integration is not implemented yet.`,
        color: 'blue'
      })
    }
  };

  const handleDisconnect = async (id: string) => {
    try {
      setLoading((prev) => ({ ...prev, [id]: true }));
      await disconnectIntegration(id);
      notifications.show({
        title: 'Disconnected',
        message: `Successfully disconnected ${id}.`,
        color: 'teal',
      });
    } catch (err: unknown) {
       notifications.show({
        title: 'Disconnection Failed',
        message: err instanceof Error ? err.message : `Failed to disconnect ${id}.`,
        color: 'red',
      });
    } finally {
      setLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <Stack gap="lg" p="md">
      <Group justify="space-between" align="flex-end">
        <Box>
          <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
            Workspace
          </Text>

          <Text fw={700} size="xl">
            Integrations
          </Text>
        </Box>
      </Group>

      <Text c="dimmed" size="sm" mb="md" maw={600}>
        Connect your workspace to external version control services to enable seamless deployments, automatic repository sync, and CI/CD features.
      </Text>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {INTEGRATION_OPTIONS.map((integration) => {
          const connectedIntegration = integrations.find(i => i.provider === integration.id);
          const isConnected = !!connectedIntegration && connectedIntegration.isActive;
          
          const isLoading = loading[integration.id] || isLoadingIntegrations;
          const IconComponent = integration.icon;

          return (
            <Card
              key={integration.id}
              withBorder
              radius="md"
              padding="md"
              style={{ display: 'flex', flexDirection: 'column' }}
            >
              <Group justify="space-between" mb="sm" align="center">
                <Group gap="sm">
                  <ThemeIcon
                    size={38}
                    radius="md"
                    variant="light"
                    color={isConnected ? integration.color : 'gray'}
                  >
                    <IconComponent size={20} stroke={1.5} />
                  </ThemeIcon>
                  <Text fw={600} size="sm">
                    {integration.name}
                  </Text>
                </Group>

                {isConnected ? (
                  <Badge
                    color="teal"
                    variant="light"
                    size="xs"
                    leftSection={<IconCheck size={10} />}
                  >
                    Connected
                  </Badge>
                ) : (
                  <Badge color="gray" variant="light" size="xs">
                    Not Connected
                  </Badge>
                )}
              </Group>

              <Text size="xs" c="dimmed" mb="md" style={{ flexGrow: 1 }}>
                {integration.description}
              </Text>
              
              {isConnected && connectedIntegration?.accountName && (
                <Badge color="gray" variant="dot" size="sm" mb="md" style={{ alignSelf: 'flex-start' }}>
                  {connectedIntegration.accountName}
                </Badge>
              )}

              <Button
                fullWidth
                variant={isConnected ? 'light' : 'default'}
                color={isConnected ? 'red' : 'gray'}
                size="xs"
                onClick={() => isConnected ? handleDisconnect(integration.id) : handleConnect(integration.id)}
                loading={isLoading}
                leftSection={!isConnected && !isLoading && <IconPlugConnected size={14} />}
                mt="auto"
              >
                {isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
