'use client';

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Stepper,
  Switch,
  Text,
  TextInput,
  Textarea,
  ThemeIcon,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconBolt,
  IconBrandGithub,
  IconChartDots3,
  IconChevronDown,
  IconChevronUp,
  IconCloud,
  IconDatabaseCog,
  IconPackage,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useGetProjects } from '@/hooks/useProjects';
import { useGetServers, useCheckPort } from '@/hooks/useServers';
import { useGetGithubRepos, useGetGithubBranches } from '@/hooks/useIntegrations';
import { useCreateService, useUpdateService, useGetServiceDetails } from '@/hooks/useServices';

const STEP_CONFIG = [
  {
    key: 'service',
    title: 'Service',
    description: 'Service runtime details',
    icon: <IconPackage size={16} />,
  },
  {
    key: 'git',
    title: 'Git',
    description: 'Repository source',
    icon: <IconBrandGithub size={16} />,
  },
  {
    key: 'env',
    title: 'Environment',
    description: 'Variables and secrets',
    icon: <IconDatabaseCog size={16} />,
  },
  {
    key: 'infra',
    title: 'Infrastructure',
    description: 'Compute and network',
    icon: <IconCloud size={16} />,
  },
  {
    key: 'deploy',
    title: 'Deployment',
    description: 'Release behavior',
    icon: <IconPlayerPlay size={16} />,
  },
  {
    key: 'observability',
    title: 'Observability',
    description: 'Metrics and alerts',
    icon: <IconChartDots3 size={16} />,
  },
] as const;

type StepKey = (typeof STEP_CONFIG)[number]['key'];

const SERVICE_TYPE_OPTIONS = [
  { value: 'web', label: 'Web Service' },
  { value: 'worker', label: 'Worker' },
  { value: 'cron', label: 'Cron Job' },
  { value: 'static', label: 'Static Site' },
];

const FRAMEWORK_OPTIONS = [
  { value: 'node', label: 'Node.js' },
  { value: 'bun', label: 'Bun' },
  { value: 'go', label: 'Go' },
  { value: 'dotnet', label: '.NET' },
];

const GIT_PROVIDER_OPTIONS = [
  { value: 'github', label: 'GitHub' },
  { value: 'gitlab', label: 'GitLab' },
  { value: 'bitbucket', label: 'Bitbucket' },
];


const DEPLOYMENT_STRATEGY_OPTIONS = [
  { value: 'rolling', label: 'Rolling' },
  { value: 'recreate', label: 'Recreate' },
  { value: 'blue_green', label: 'Blue / Green' },
];

const BUILD_TRIGGER_OPTIONS = [
  { value: 'push', label: 'Push' },
  { value: 'manual', label: 'Manual' },
  { value: 'tag', label: 'Tag' },
];

const CONTAINER_TYPE_OPTIONS = [
  { value: 'docker', label: 'Docker' },
  { value: 'containerd', label: 'containerd' },
  { value: 'podman', label: 'Podman' },
];

const NETWORK_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'private', label: 'Private' },
  { value: 'hybrid', label: 'Hybrid' },
];

const LOG_RETENTION_OPTIONS = [
  { value: '7d', label: '7 days' },
  { value: '14d', label: '14 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

const ALERT_OPTIONS = [
  { value: 'disabled', label: 'Disabled' },
  { value: 'critical', label: 'Critical only' },
  { value: 'all', label: 'All alerts' },
];

interface ServiceCreationPageProps {
  workspaceId: string;
  initialProjectId?: string;
  environmentId?: string;
  serviceId?: string; // when provided, the page is in edit mode
}

function SectionHeader({
  title,
  description,
  icon,
  color,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  color: string;
}) {
  return (
    <Group justify='space-between' align='flex-start'>
      <Box>
        <Text fw={700} size='lg'>
          {title}
        </Text>
        <Text size='sm' c='dimmed' mt={4}>
          {description}
        </Text>
      </Box>
      <ThemeIcon size={40} radius='md' variant='light' color={color}>
        {icon}
      </ThemeIcon>
    </Group>
  );
}

function SectionLabel({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box>
      <Text fw={600} size='sm'>
        {title}
      </Text>
      {description ? (
        <Text size='xs' c='dimmed' mt={2}>
          {description}
        </Text>
      ) : null}
    </Box>
  );
}

function AdvancedSectionToggle({
  opened,
  onToggle,
}: {
  opened: boolean;
  onToggle: () => void;
}) {
  return (
    <Button
      type='button'
      variant='subtle'
      color='gray'
      px={0}
      justify='flex-start'
      leftSection={
        opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
      }
      onClick={onToggle}>
      {opened ? 'Hide advanced options' : 'Show advanced options'}
    </Button>
  );
}

export default function ServiceCreationPage({
  workspaceId,
  initialProjectId,
  serviceId,
}: ServiceCreationPageProps) {
  const router = useRouter();
  const isEditMode = !!serviceId;
  const [activeStep, setActiveStep] = useState(0);
  const [advancedSections, setAdvancedSections] = useState({
    service: false,
    git: false,
    infra: false,
    deploy: false,
    observability: false,
  });
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<Record<StepKey, HTMLDivElement | null>>({
    service: null,
    git: null,
    env: null,
    infra: null,
    deploy: null,
    observability: null,
  });
  const { data: projects = [] } = useGetProjects(workspaceId, true);
  const { data: servers = [] } = useGetServers(workspaceId, true);

  const projectOptions = projects.map((project) => ({
    value: project.uuid,
    label: project.name,
  }));

  const serverOptions = servers.map((server) => ({
    value: server.uuid,
    label: server.name,
  }));

  const form = useForm({
    initialValues: {
      projectId: initialProjectId ?? '',
      name: '',
      description: '',
      serviceType: '',
      framework: '',
      buildCommand: '',
      startCommand: '',
      outputDirectory: 'dist',
      port: 3000,
      dockerizeType: 'auto',
      runtimeVersion: '',
      healthCheckPath: '',
      instanceCount: 1,
      gitProvider: '',
      repository: '',
      branch: 'main',
      rootFolder: '',
      autoDeployOnPush: true,
      buildTrigger: 'push',
      envVars: [{ key: '', value: '' }],
      serverId: '',
      cpu: 1,
      memory: 512,
      disk: 10,
      containerType: 'docker',
      network: 'public',
      customDomain: '',
      ssl: true,
      certType: 'auto',
      customCert: '',
      customKey: '',
      strategy: 'rolling',
      autoRollback: true,
      timeout: 300,
      retries: 3,
      metricsEnabled: true,
      logRetention: '30d',
      alerts: 'critical',
    },
    validate: {
      projectId: (value) => (!value ? 'Choose a project' : null),
      name: (value) =>
        value.trim().length < 2 ? 'Name must be at least 2 characters' : null,
      serviceType: (value) => (!value ? 'Choose a service type' : null),
      framework: (value) => (!value ? 'Choose a framework' : null),
      buildCommand: (value) =>
        !value.trim() ? 'Build command is required' : null,
      startCommand: (value) =>
        !value.trim() ? 'Start command is required' : null,
      dockerizeType: (value) => (!value ? 'Choose a dockerization approach' : null),
      port: (value) =>
        !value || value < 1 || value > 65535 ? 'Enter a valid port' : null,
      gitProvider: (value) => (!value ? 'Choose a git provider' : null),
      repository: (value) => (!value.trim() ? 'Repository is required' : null),
      branch: (value) => (!value.trim() ? 'Branch is required' : null),
      envVars: {
        key: (value) => (!value.trim() ? 'Environment key is required' : null),
        value: (value) =>
          !value.trim() ? 'Environment value is required' : null,
      },
      serverId: (value) => (!value ? 'Choose a server' : null),
      strategy: (value) => (!value ? 'Choose a deployment strategy' : null),
    },
  });

  const { mutateAsync: createService, isPending: isCreating } = useCreateService(
    workspaceId,
    form.values.projectId,
  );

  const { mutateAsync: updateService, isPending: isUpdating } = useUpdateService(
    workspaceId,
    form.values.projectId,
    serviceId ?? '',
  );

  const isPending = isCreating || isUpdating;

  const { data: githubRepos = [], isLoading: isLoadingRepos } = useGetGithubRepos(
    workspaceId,
    form.values?.gitProvider === 'github'
  );

  const { data: githubBranches = [], isLoading: isLoadingBranches } = useGetGithubBranches(
    workspaceId,
    form.values?.repository,
    form.values?.gitProvider === 'github' && !!form.values?.repository
  );

  const repoOptions = githubRepos.map((repo) => ({
    value: repo.fullName,
    label: repo.fullName,
  }));

  const branchOptions = githubBranches.map((branch) => ({
    value: branch.name,
    label: branch.name,
  }));

  const { data: portAvailable } = useCheckPort(
    workspaceId,
    form.values.serverId,
    form.values.port,
    !!form.values.serverId && !!form.values.port
  );

  useEffect(() => {
    if (!initialProjectId) return;
    form.setFieldValue('projectId', initialProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

  // Pre-populate form in edit mode
  const { data: serviceDetails } = useGetServiceDetails(
    workspaceId,
    form.values.projectId || initialProjectId || '',
    serviceId ?? '',
  );

  useEffect(() => {
    if (!serviceDetails || !isEditMode) return;
    const d = serviceDetails.data;
    form.setValues({
      projectId: initialProjectId ?? form.values.projectId,
      name: d.name,
      description: d.description ?? '',
      serviceType: d.type,
      framework: d.framework,
      buildCommand: d.buildCommand,
      startCommand: d.startCommand,
      outputDirectory: d.outputDirectory ?? 'dist',
      port: d.port,
      dockerizeType: d.dockerizeType,
      healthCheckPath: '',
      instanceCount: 1,
      runtimeVersion: '',
      gitProvider: d.git?.provider ?? '',
      repository: d.git?.repositoryUrl ?? '',
      branch: d.git?.branch ?? 'main',
      rootFolder: d.git?.subDirectory ?? '',
      autoDeployOnPush: d.git?.autoDeploy ?? true,
      buildTrigger: 'push',
      envVars: d.envVariables && d.envVariables.length > 0
        ? d.envVariables.map((v) => ({ key: v.key, value: v.value }))
        : [{ key: '', value: '' }],
      serverId: d.server?.serverId ? String(d.server.serverId) : '',
      cpu: 1,
      memory: 512,
      disk: 10,
      containerType: 'docker',
      network: 'public',
      customDomain: d.domain ?? '',
      ssl: d.httpsEnabled ?? true,
      certType: d.certType ?? 'auto',
      customCert: d.customCert ?? '',
      customKey: d.customKey ?? '',
      strategy: 'rolling',
      autoRollback: true,
      timeout: 300,
      retries: 3,
      metricsEnabled: true,
      logRetention: '30d',
      alerts: 'critical',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serviceDetails]);

  useEffect(() => {
    const root = viewportRef.current;
    if (!root) return;

    const updateActiveStep = () => {
      const rootRect = root.getBoundingClientRect();
      const rootTop = rootRect.top;
      const rootBottom = rootRect.bottom;

      let bestIndex = 0;
      let bestDistance = Number.POSITIVE_INFINITY;

      STEP_CONFIG.forEach((step, index) => {
        const node = sectionRefs.current[step.key];
        if (!node) return;

        const rect = node.getBoundingClientRect();
        const isVisible = rect.bottom > rootTop && rect.top < rootBottom;

        if (!isVisible) return;

        const distance = Math.abs(rect.top - rootTop - 16);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });

      const lastStep = STEP_CONFIG[STEP_CONFIG.length - 1];
      const lastNode = sectionRefs.current[lastStep.key];
      if (lastNode) {
        const lastRect = lastNode.getBoundingClientRect();
        if (lastRect.top <= rootBottom - 80) {
          bestIndex = STEP_CONFIG.length - 1;
        }
      }

      setActiveStep(bestIndex);
    };

    updateActiveStep();
    root.addEventListener('scroll', updateActiveStep, { passive: true });
    window.addEventListener('resize', updateActiveStep);

    return () => {
      root.removeEventListener('scroll', updateActiveStep);
      window.removeEventListener('resize', updateActiveStep);
    };
  }, []);

  const scrollToStep = (key: StepKey) => {
    const root = viewportRef.current;
    const node = sectionRefs.current[key];
    if (!node || !root) return;

    const rootRect = root.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const nextTop = root.scrollTop + (nodeRect.top - rootRect.top) - 12;

    root.scrollTo({
      top: nextTop,
      behavior: 'smooth',
    });
  };

  const handleSubmit = form.onSubmit(async (values) => {
    const payload = {
      name: values.name,
      projectUuid: values.projectId,
      type: values.serviceType,
      framework: values.framework,
      description: values.description,
      buildCommand: values.buildCommand,
      startCommand: values.startCommand,
      deployPath: values.rootFolder || '/',
      outputDirectory: values.outputDirectory,
      port: values.port,
      dockerizeType: values.dockerizeType,
      domain: values.customDomain,
      httpsEnabled: values.ssl,
      certType: values.certType,
      customCert: values.customCert,
      customKey: values.customKey,
      serverId: values.serverId,
      git: {
        provider: values.gitProvider,
        repositoryUrl: values.repository,
        branch: values.branch,
        subDirectory: values.rootFolder || '/',
        authType: 'token',
        autoDeploy: values.autoDeployOnPush,
        webhookEnabled: true,
      },
      envVariables: values.envVars
        .filter((v) => v.key.trim() !== '')
        .map((v) => ({
          key: v.key,
          value: v.value,
          isSecret: false,
          isBuildVariable: false,
        })),
    };
    try {
      notifications.show({
        title: isEditMode ? 'Updating service' : 'Creating service',
        message: `"${values.name}" is being ${isEditMode ? 'updated' : 'created'}.`,
        color: 'blue',
      });

      if (isEditMode) {
        await updateService(payload);
      } else {
        await createService(payload);
      }

      notifications.show({
        title: isEditMode ? 'Service updated' : 'Service created',
        message: `"${values.name}" has been successfully ${isEditMode ? 'updated' : 'created'}.`,
        color: 'teal',
      });

      router.push(`/app/${workspaceId}/projects/${values.projectId}`);
    } catch (err: unknown) {
      type AxiosLike = { response?: { data?: { error?: string } } };
      const axiosErr = err as AxiosLike;
      const message =
        axiosErr?.response?.data?.error
          ? String(axiosErr.response.data.error)
          : err instanceof Error
            ? err.message
            : 'Failed to create service';

      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  });

  const toggleAdvancedSection = (key: keyof typeof advancedSections) => {
    setAdvancedSections((current) => ({
      ...current,
      [key]: !current[key],
    }));
  };

  return (
    <Stack
      gap='lg'
      p='md'
      h='calc(100dvh - 70px)'
      style={{ minHeight: 0, overflow: 'hidden' }}>
      <Group justify='space-between' align='flex-start'>
        <Box>
          <Group gap='sm' mb={8}>
            <Button
              variant='subtle'
              color='gray'
              size='compact-sm'
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.back()}>
              Back
            </Button>
            <Badge variant='light' color='gray' radius='sm'>
              {isEditMode ? 'Edit Service' : 'Service Creation'}
            </Badge>
          </Group>

          <Text fw={700} size='xl'>
            {isEditMode ? 'Edit Service' : 'Create Service'}
          </Text>
          <Text size='sm' c='dimmed' mt={4}>
            {isEditMode
              ? 'Update the configuration of your existing service.'
              : 'Multi-step Service setup tied to a project. Active step follows the section currently on screen.'}
          </Text>
        </Box>

        <Group gap='sm'>
          <Button
            variant='default'
            radius='sm'
            onClick={() => router.push(`/app/${workspaceId}/services`)}>
            Cancel
          </Button>
          <Button radius='sm' loading={isPending} onClick={() => handleSubmit()}>
            {isEditMode ? 'Save Changes' : 'Create'}
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius='md' p='md'>
        <Stepper
          active={activeStep}
          onStepClick={(index) => scrollToStep(STEP_CONFIG[index].key)}
          allowNextStepsSelect
          size='sm'>
          {STEP_CONFIG.map((step) => (
            <Stepper.Step
              key={step.key}
              label={step.title}
              description={step.description}
              icon={step.icon}
            />
          ))}
        </Stepper>
      </Paper>

      <ScrollArea
        type='never'
        offsetScrollbars
        viewportRef={viewportRef}
        style={{ flex: 1, minHeight: 0 }}>
        <div>
          <form onSubmit={handleSubmit}>
            <Stack gap='lg' pb='xl'>
              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.service = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='1. Service Information'
                    description='Basic identity, runtime, and launch configuration for the Service.'
                    icon={<IconPackage size={20} />}
                    color='indigo'
                  />
                  <Divider />
                  <SectionLabel
                    title='Basic'
                    description='Core service details required for initial setup.'
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                    <Select
                      label='Project'
                      data={projectOptions}
                      placeholder='Select a project'
                      withAsterisk
                      {...form.getInputProps('projectId')}
                    />
                    <TextInput
                      label='Name'
                      placeholder='API Service'
                      withAsterisk
                      {...form.getInputProps('name')}
                    />
                    <Select
                      label='Service Type'
                      data={SERVICE_TYPE_OPTIONS}
                      placeholder='Select service type'
                      withAsterisk
                      {...form.getInputProps('serviceType')}
                    />
                    <Select
                      label='Dockerization'
                      data={[
                        { value: 'auto', label: 'Dockerize on the go' },
                        { value: 'custom', label: 'Dockerfile is present' },
                      ]}
                      placeholder='Select dockerize type'
                      withAsterisk
                      {...form.getInputProps('dockerizeType')}
                    />
                    <Select
                      label='Framework'
                      data={FRAMEWORK_OPTIONS}
                      placeholder='Select framework'
                      withAsterisk
                      {...form.getInputProps('framework')}
                    />
                    <TextInput
                      label='Build Command'
                      placeholder='npm run build'
                      withAsterisk
                      {...form.getInputProps('buildCommand')}
                    />
                    <TextInput
                      label='Start Command'
                      placeholder='npm run start'
                      withAsterisk
                      {...form.getInputProps('startCommand')}
                    />
                    {(form.values.serviceType === 'static' || form.values.serviceType === 'frontend') && (
                      <TextInput
                        label='Output Folder Name'
                        placeholder='dist, build, or .next'
                        {...form.getInputProps('outputDirectory')}
                      />
                    )}
                    <Box>
                      <NumberInput
                        label='Port'
                        min={1}
                        max={65535}
                        withAsterisk
                        {...form.getInputProps('port')}
                      />
                      {portAvailable === false && (
                        <Group gap={4} mt={4}>
                          <IconAlertTriangle size={14} color="orange" />
                          <Text size="xs" c="orange">
                            Warning: Port is already in use on this server
                          </Text>
                        </Group>
                      )}
                    </Box>
                  </SimpleGrid>
                  <Textarea
                    label='Description'
                    placeholder='Describe this service'
                    minRows={3}
                    autosize
                    {...form.getInputProps('description')}
                  />
                  <Stack gap='sm'>
                    <AdvancedSectionToggle
                      opened={advancedSections.service}
                      onToggle={() => toggleAdvancedSection('service')}
                    />
                    <Collapse in={advancedSections.service}>
                      <Stack gap='md'>
                        <SectionLabel
                          title='Advanced'
                          description='Optional runtime and scaling controls.'
                        />
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                          <TextInput
                            label='Runtime Version'
                            placeholder='Node 20'
                            {...form.getInputProps('runtimeVersion')}
                          />
                          <TextInput
                            label='Health Check Path'
                            placeholder='/health'
                            {...form.getInputProps('healthCheckPath')}
                          />
                          <NumberInput
                            label='Instance Count'
                            min={1}
                            {...form.getInputProps('instanceCount')}
                          />
                        </SimpleGrid>
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.git = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='2. Git Configuration'
                    description='Source control details for builds and deployments.'
                    icon={<IconBrandGithub size={20} />}
                    color='grape'
                  />
                  <Divider />
                  <SectionLabel
                    title='Basic'
                    description='Repository connection details used for builds.'
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                    <Select
                      label='Git Provider'
                      data={GIT_PROVIDER_OPTIONS}
                      placeholder='Select provider'
                      withAsterisk
                      {...form.getInputProps('gitProvider')}
                      onChange={(val) => {
                        form.setFieldValue('gitProvider', val || '');
                        if (val === 'github') {
                          form.setFieldValue('repository', '');
                          form.setFieldValue('branch', '');
                        }
                      }}
                    />

                    {form.values.gitProvider === 'github' ? (
                      <Select
                        label='Repository'
                        data={repoOptions}
                        placeholder={isLoadingRepos ? 'Loading...' : 'Select a repository'}
                        searchable
                        withAsterisk
                        disabled={isLoadingRepos}
                        {...form.getInputProps('repository')}
                        onChange={(val) => {
                          form.setFieldValue('repository', val || '');
                          form.setFieldValue('branch', '');
                        }}
                      />
                    ) : (
                      <TextInput
                        label='Repository'
                        placeholder='org/repo or full URL'
                        withAsterisk
                        {...form.getInputProps('repository')}
                      />
                    )}

                    {form.values.gitProvider === 'github' ? (
                      <Select
                        label='Branch'
                        data={branchOptions}
                        placeholder={isLoadingBranches ? 'Loading...' : 'Select a branch'}
                        searchable
                        withAsterisk
                        disabled={!form.values.repository || isLoadingBranches}
                        {...form.getInputProps('branch')}
                      />
                    ) : (
                      <TextInput
                        label='Branch'
                        placeholder='main'
                        withAsterisk
                        {...form.getInputProps('branch')}
                      />
                    )}
                  </SimpleGrid>
                  <Stack gap='sm'>
                    <AdvancedSectionToggle
                      opened={advancedSections.git}
                      onToggle={() => toggleAdvancedSection('git')}
                    />
                    <Collapse in={advancedSections.git}>
                      <Stack gap='md'>
                        <SectionLabel
                          title='Advanced'
                          description='Optional repository path and trigger behavior.'
                        />
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                          <TextInput
                            label='Root Folder'
                            placeholder='apps/api'
                            {...form.getInputProps('rootFolder')}
                          />
                          <Select
                            label='Build Trigger'
                            data={BUILD_TRIGGER_OPTIONS}
                            {...form.getInputProps('buildTrigger')}
                          />
                        </SimpleGrid>
                        <Switch
                          label='Auto Deploy on Push'
                          checked={form.values.autoDeployOnPush}
                          {...form.getInputProps('autoDeployOnPush', {
                            type: 'checkbox',
                          })}
                        />
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.env = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='3. Environment Variables'
                    description='User-entered values only. Secrets and computed values can be handled later by the backend.'
                    icon={<IconDatabaseCog size={20} />}
                    color='teal'
                  />
                  <SectionLabel
                    title='Basic'
                    description='Runtime key-value pairs passed to the service.'
                  />
                  <Group justify='space-between' align='center'>
                    <Divider style={{ flex: 1 }} />
                    <Button
                      type='button'
                      variant='subtle'
                      size='xs'
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        form.insertListItem('envVars', { key: '', value: '' })
                      }>
                      Add Variable
                    </Button>
                  </Group>
                  <Stack gap='md'>
                    {form.values.envVars.map((_, index) => (
                      <Group key={index} align='flex-start' wrap='nowrap'>
                        <SimpleGrid
                          cols={{ base: 1, md: 2 }}
                          spacing='md'
                          style={{ flex: 1 }}>
                          <TextInput
                            label={index === 0 ? 'Key' : undefined}
                            placeholder='DATABASE_URL'
                            withAsterisk
                            {...form.getInputProps(`envVars.${index}.key`)}
                          />
                          <TextInput
                            label={index === 0 ? 'Value' : undefined}
                            placeholder='postgres://...'
                            withAsterisk
                            {...form.getInputProps(`envVars.${index}.value`)}
                          />
                        </SimpleGrid>
                        <ActionIcon
                          type='button'
                          mt={index === 0 ? 30 : 0}
                          variant='subtle'
                          color='red'
                          onClick={() => form.removeListItem('envVars', index)}
                          disabled={form.values.envVars.length === 1}>
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.infra = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='4. Infrastructure'
                    description='Compute and network settings attached to the service.'
                    icon={<IconCloud size={20} />}
                    color='cyan'
                  />
                  <Divider />
                  <SectionLabel
                    title='Basic'
                    description='Target server for the deployment.'
                  />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                    <Select
                      label='Server'
                      data={serverOptions}
                      placeholder='Select a server'
                      withAsterisk
                      {...form.getInputProps('serverId')}
                    />
                    <TextInput
                      label='Custom Domain'
                      placeholder='api.example.com'
                      {...form.getInputProps('customDomain')}
                    />
                  </SimpleGrid>
                  <Stack gap='sm'>
                    <AdvancedSectionToggle
                      opened={advancedSections.infra}
                      onToggle={() => toggleAdvancedSection('infra')}
                    />
                    <Collapse in={advancedSections.infra}>
                      <Stack gap='md'>
                        <SectionLabel
                          title='Advanced'
                          description='Optional compute, storage, and network tuning.'
                        />
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                          <NumberInput
                            label='CPU'
                            min={1}
                            {...form.getInputProps('cpu')}
                          />
                          <NumberInput
                            label='Memory (MB)'
                            min={128}
                            step={128}
                            {...form.getInputProps('memory')}
                          />
                          <NumberInput
                            label='Disk (GB)'
                            min={1}
                            {...form.getInputProps('disk')}
                          />
                          <Select
                            label='Container Type'
                            data={CONTAINER_TYPE_OPTIONS}
                            {...form.getInputProps('containerType')}
                          />
                          <Select
                            label='Network'
                            data={NETWORK_OPTIONS}
                            {...form.getInputProps('network')}
                          />
                        </SimpleGrid>
                        <Switch
                          label='Enable HTTPS'
                          checked={form.values.ssl}
                          {...form.getInputProps('ssl', {
                            type: 'checkbox',
                          })}
                        />
                        {form.values.ssl && (
                          <Stack gap="md" mt="sm">
                            <Select
                              label="Certificate Type"
                              data={[
                                { value: 'auto', label: 'Automatic (Certbot)' },
                                { value: 'custom', label: 'Custom Certificate' }
                              ]}
                              {...form.getInputProps('certType')}
                            />
                            {form.values.certType === 'custom' && (
                              <SimpleGrid cols={1} spacing="md">
                                <Textarea
                                  label="Custom SSL Certificate (fullchain.pem)"
                                  placeholder="-----BEGIN CERTIFICATE-----\n..."
                                  minRows={4}
                                  {...form.getInputProps('customCert')}
                                />
                                <Textarea
                                  label="Custom SSL Private Key (privkey.pem)"
                                  placeholder="-----BEGIN PRIVATE KEY-----\n..."
                                  minRows={4}
                                  {...form.getInputProps('customKey')}
                                />
                              </SimpleGrid>
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.deploy = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='5. Deployment'
                    description='Release behavior and failure handling.'
                    icon={<IconPlayerPlay size={20} />}
                    color='orange'
                  />
                  <Divider />
                  <SectionLabel
                    title='Basic'
                    description='Primary rollout strategy for service updates.'
                  />
                  <Select
                    label='Strategy'
                    data={DEPLOYMENT_STRATEGY_OPTIONS}
                    withAsterisk
                    {...form.getInputProps('strategy')}
                  />
                  <Stack gap='sm'>
                    <AdvancedSectionToggle
                      opened={advancedSections.deploy}
                      onToggle={() => toggleAdvancedSection('deploy')}
                    />
                    <Collapse in={advancedSections.deploy}>
                      <Stack gap='md'>
                        <SectionLabel
                          title='Advanced'
                          description='Failure handling and deployment guardrails.'
                        />
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                          <NumberInput
                            label='Timeout (seconds)'
                            min={30}
                            step={30}
                            {...form.getInputProps('timeout')}
                          />
                          <NumberInput
                            label='Retries'
                            min={0}
                            {...form.getInputProps('retries')}
                          />
                        </SimpleGrid>
                        <Switch
                          label='Auto Rollback'
                          checked={form.values.autoRollback}
                          {...form.getInputProps('autoRollback', {
                            type: 'checkbox',
                          })}
                        />
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius='md'
                p='xl'
                ref={(node) => {
                  sectionRefs.current.observability = node;
                }}>
                <Stack gap='lg'>
                  <SectionHeader
                    title='6. Observability'
                    description='Metrics, logs, and alerting preferences.'
                    icon={<IconBolt size={20} />}
                    color='pink'
                  />
                  <Divider />
                  <SectionLabel
                    title='Basic'
                    description='Toggle baseline metrics collection for the service.'
                  />
                  <Switch
                    label='Metrics Enabled'
                    checked={form.values.metricsEnabled}
                    {...form.getInputProps('metricsEnabled', {
                      type: 'checkbox',
                    })}
                  />
                  <Stack gap='sm'>
                    <AdvancedSectionToggle
                      opened={advancedSections.observability}
                      onToggle={() => toggleAdvancedSection('observability')}
                    />
                    <Collapse in={advancedSections.observability}>
                      <Stack gap='md'>
                        <SectionLabel
                          title='Advanced'
                          description='Log retention and alerting preferences.'
                        />
                        <SimpleGrid cols={{ base: 1, md: 2 }} spacing='md'>
                          <Select
                            label='Log Retention'
                            data={LOG_RETENTION_OPTIONS}
                            {...form.getInputProps('logRetention')}
                          />
                          <Select
                            label='Alerts'
                            data={ALERT_OPTIONS}
                            {...form.getInputProps('alerts')}
                          />
                        </SimpleGrid>
                      </Stack>
                    </Collapse>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          </form>
        </div>
      </ScrollArea>
    </Stack>
  );
}
