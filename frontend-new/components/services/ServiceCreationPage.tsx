"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconBolt,
  IconBrandGithub,
  IconChartDots3,
  IconCloud,
  IconDatabaseCog,
  IconPackage,
  IconPlayerPlay,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useGetProjects } from "@/hooks/useProjects";

const STEP_CONFIG = [
  {
    key: "service",
    title: "Service",
    description: "App runtime details",
    icon: <IconPackage size={16} />,
  },
  {
    key: "git",
    title: "Git",
    description: "Repository source",
    icon: <IconBrandGithub size={16} />,
  },
  {
    key: "env",
    title: "Environment",
    description: "Variables and secrets",
    icon: <IconDatabaseCog size={16} />,
  },
  {
    key: "infra",
    title: "Infrastructure",
    description: "Compute and network",
    icon: <IconCloud size={16} />,
  },
  {
    key: "deploy",
    title: "Deployment",
    description: "Release behavior",
    icon: <IconPlayerPlay size={16} />,
  },
  {
    key: "observability",
    title: "Observability",
    description: "Metrics and alerts",
    icon: <IconChartDots3 size={16} />,
  },
] as const;

type StepKey = (typeof STEP_CONFIG)[number]["key"];

const SERVICE_TYPE_OPTIONS = [
  { value: "web", label: "Web Service" },
  { value: "worker", label: "Worker" },
  { value: "cron", label: "Cron Job" },
];

const FRAMEWORK_OPTIONS = [
  { value: "node", label: "Node" },
  { value: "go", label: "Go" },
  { value: "dotnet", label: ".NET" },
];

const GIT_PROVIDER_OPTIONS = [
  { value: "github", label: "GitHub" },
  { value: "gitlab", label: "GitLab" },
  { value: "bitbucket", label: "Bitbucket" },
];

const PROVIDER_OPTIONS = [
  { value: "aws", label: "AWS" },
  { value: "gcp", label: "Google Cloud" },
  { value: "azure", label: "Azure" },
  { value: "custom", label: "Custom / Bare Metal" },
];

const REGION_OPTIONS = [
  { value: "ap-south-1", label: "Mumbai" },
  { value: "us-east-1", label: "N. Virginia" },
  { value: "eu-west-1", label: "Ireland" },
];

const DEPLOYMENT_STRATEGY_OPTIONS = [
  { value: "rolling", label: "Rolling" },
  { value: "recreate", label: "Recreate" },
  { value: "blue_green", label: "Blue / Green" },
];

interface ServiceCreationPageProps {
  workspaceId: string;
  initialProjectId?: string;
  environmentId?: string;
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
    <Group justify="space-between" align="flex-start">
      <Box>
        <Text fw={700} size="lg">
          {title}
        </Text>
        <Text size="sm" c="dimmed" mt={4}>
          {description}
        </Text>
      </Box>
      <ThemeIcon size={40} radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
    </Group>
  );
}

export default function ServiceCreationPage({
  workspaceId,
  initialProjectId,
  environmentId,
}: ServiceCreationPageProps) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
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

  const projectOptions = projects.map((project) => ({
    value: project.uuid,
    label: project.name,
  }));

  const form = useForm({
    initialValues: {
      projectId: initialProjectId ?? "",
      name: "",
      description: "",
      serviceType: "",
      framework: "",
      buildCommand: "",
      startCommand: "",
      port: 3000,
      gitProvider: "",
      repository: "",
      branch: "main",
      envVars: [{ key: "", value: "" }],
      provider: "",
      region: "",
      instanceType: "",
      strategy: "rolling",
      metricsEnabled: true,
    },
    validate: {
      projectId: (value) => (!value ? "Choose a project" : null),
      name: (value) =>
        value.trim().length < 2 ? "Name must be at least 2 characters" : null,
      serviceType: (value) => (!value ? "Choose a service type" : null),
      framework: (value) => (!value ? "Choose a framework" : null),
      buildCommand: (value) =>
        !value.trim() ? "Build command is required" : null,
      startCommand: (value) =>
        !value.trim() ? "Start command is required" : null,
      port: (value) =>
        !value || value < 1 || value > 65535 ? "Enter a valid port" : null,
      gitProvider: (value) => (!value ? "Choose a git provider" : null),
      repository: (value) => (!value.trim() ? "Repository is required" : null),
      branch: (value) => (!value.trim() ? "Branch is required" : null),
      envVars: {
        key: (value) => (!value.trim() ? "Environment key is required" : null),
        value: (value) =>
          !value.trim() ? "Environment value is required" : null,
      },
      provider: (value) =>
        !value ? "Choose an infrastructure provider" : null,
      region: (value) => (!value ? "Choose a region" : null),
      instanceType: (value) =>
        !value.trim() ? "Instance type is required" : null,
      strategy: (value) => (!value ? "Choose a deployment strategy" : null),
    },
  });

  useEffect(() => {
    if (!initialProjectId) return;
    form.setFieldValue("projectId", initialProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialProjectId]);

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
    root.addEventListener("scroll", updateActiveStep, { passive: true });
    window.addEventListener("resize", updateActiveStep);

    return () => {
      root.removeEventListener("scroll", updateActiveStep);
      window.removeEventListener("resize", updateActiveStep);
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
      behavior: "smooth",
    });
  };

  const handleSubmit = form.onSubmit((values) => {
    notifications.show({
      title: "Frontend draft ready",
      message: `Captured "${values.name}" setup inputs. service persistence can be wired once the backend contract is finalized.`,
      color: "teal",
    });
  });

  return (
    <Stack gap="lg" p="md" h="calc(100dvh - 96px)" style={{ minHeight: 0 }}>
      <Group justify="space-between" align="flex-start">
        <Box>
          <Group gap="sm" mb={8}>
            <Button
              variant="subtle"
              color="gray"
              size="compact-sm"
              leftSection={<IconArrowLeft size={14} />}
              onClick={() => router.back()}
            >
              Back
            </Button>
            <Badge variant="light" color="gray" radius="sm">
              Service Creation
            </Badge>
          </Group>

          <Text fw={700} size="xl">
            Create Service
          </Text>
          <Text size="sm" c="dimmed" mt={4}>
            Multi-step server/service setup tied to a project. Active step
            follows the section currently on screen.
          </Text>
        </Box>

        <Group gap="sm">
          <Button
            variant="default"
            radius="sm"
            onClick={() => router.push(`/app/${workspaceId}/servers`)}
          >
            Cancel
          </Button>
          <Button radius="sm" onClick={() => handleSubmit()}>
            Create
          </Button>
        </Group>
      </Group>

      <Paper withBorder radius="md" p="md">
        <Stepper
          active={activeStep}
          onStepClick={(index) => scrollToStep(STEP_CONFIG[index].key)}
          allowNextStepsSelect
          size="sm"
        >
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
        type="never"
        offsetScrollbars
        viewportRef={viewportRef}
        style={{ flex: 1, minHeight: 0 }}
      >
        <div>
          <form onSubmit={handleSubmit}>
            <Stack gap="lg" pb="xl">
              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.service = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="1. Service Information"
                    description="Basic identity, runtime, and launch configuration."
                    icon={<IconPackage size={20} />}
                    color="indigo"
                  />
                  <Divider />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Project"
                      data={projectOptions}
                      placeholder="Select a project"
                      withAsterisk
                      {...form.getInputProps("projectId")}
                    />
                    <TextInput
                      label="Name"
                      placeholder="API Service"
                      withAsterisk
                      {...form.getInputProps("name")}
                    />
                    <Select
                      label="Service Type"
                      data={SERVICE_TYPE_OPTIONS}
                      placeholder="Select service type"
                      withAsterisk
                      {...form.getInputProps("serviceType")}
                    />
                    <Select
                      label="Framework"
                      data={FRAMEWORK_OPTIONS}
                      placeholder="Select framework"
                      withAsterisk
                      {...form.getInputProps("framework")}
                    />
                    <TextInput
                      label="Build Command"
                      placeholder="npm run build"
                      withAsterisk
                      {...form.getInputProps("buildCommand")}
                    />
                    <TextInput
                      label="Start Command"
                      placeholder="npm run start"
                      withAsterisk
                      {...form.getInputProps("startCommand")}
                    />
                    <NumberInput
                      label="Port"
                      min={1}
                      max={65535}
                      withAsterisk
                      {...form.getInputProps("port")}
                    />
                  </SimpleGrid>
                  <Textarea
                    label="Description"
                    placeholder="Describe this service"
                    minRows={3}
                    autosize
                    {...form.getInputProps("description")}
                  />
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.git = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="2. Git Configuration"
                    description="Source control details for builds and deployments."
                    icon={<IconBrandGithub size={20} />}
                    color="grape"
                  />
                  <Divider />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Git Provider"
                      data={GIT_PROVIDER_OPTIONS}
                      placeholder="Select provider"
                      withAsterisk
                      {...form.getInputProps("gitProvider")}
                    />
                    <TextInput
                      label="Repository"
                      placeholder="org/repo or full URL"
                      withAsterisk
                      {...form.getInputProps("repository")}
                    />
                    <TextInput
                      label="Branch"
                      placeholder="main"
                      withAsterisk
                      {...form.getInputProps("branch")}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.env = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="3. Environment Variables"
                    description="User-entered values only. Secrets and computed values can be handled later by the backend."
                    icon={<IconDatabaseCog size={20} />}
                    color="teal"
                  />
                  <Group justify="space-between" align="center">
                    <Divider style={{ flex: 1 }} />
                    <Button
                      type="button"
                      variant="subtle"
                      size="xs"
                      leftSection={<IconPlus size={14} />}
                      onClick={() =>
                        form.insertListItem("envVars", { key: "", value: "" })
                      }
                    >
                      Add Variable
                    </Button>
                  </Group>
                  <Stack gap="md">
                    {form.values.envVars.map((_, index) => (
                      <Group key={index} align="flex-start" wrap="nowrap">
                        <SimpleGrid
                          cols={{ base: 1, md: 2 }}
                          spacing="md"
                          style={{ flex: 1 }}
                        >
                          <TextInput
                            label={index === 0 ? "Key" : undefined}
                            placeholder="DATABASE_URL"
                            withAsterisk
                            {...form.getInputProps(`envVars.${index}.key`)}
                          />
                          <TextInput
                            label={index === 0 ? "Value" : undefined}
                            placeholder="postgres://..."
                            withAsterisk
                            {...form.getInputProps(`envVars.${index}.value`)}
                          />
                        </SimpleGrid>
                        <ActionIcon
                          type="button"
                          mt={index === 0 ? 30 : 0}
                          variant="subtle"
                          color="red"
                          onClick={() => form.removeListItem("envVars", index)}
                          disabled={form.values.envVars.length === 1}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.infra = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="4. Infrastructure"
                    description="Compute and network settings attached to the service."
                    icon={<IconCloud size={20} />}
                    color="cyan"
                  />
                  <Divider />
                  <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                    <Select
                      label="Provider"
                      data={PROVIDER_OPTIONS}
                      withAsterisk
                      {...form.getInputProps("provider")}
                    />
                    <Select
                      label="Region"
                      data={REGION_OPTIONS}
                      withAsterisk
                      {...form.getInputProps("region")}
                    />
                    <TextInput
                      label="Instance Type"
                      placeholder="shared-small"
                      withAsterisk
                      {...form.getInputProps("instanceType")}
                    />
                  </SimpleGrid>
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.deploy = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="5. Deployment"
                    description="Release behavior and failure handling."
                    icon={<IconPlayerPlay size={20} />}
                    color="orange"
                  />
                  <Divider />
                  <Select
                    label="Strategy"
                    data={DEPLOYMENT_STRATEGY_OPTIONS}
                    withAsterisk
                    {...form.getInputProps("strategy")}
                  />
                </Stack>
              </Paper>

              <Paper
                withBorder
                radius="md"
                p="xl"
                ref={(node) => {
                  sectionRefs.current.observability = node;
                }}
              >
                <Stack gap="lg">
                  <SectionHeader
                    title="6. Observability"
                    description="Metrics, logs, and alerting preferences."
                    icon={<IconBolt size={20} />}
                    color="pink"
                  />
                  <Divider />
                  <Switch
                    label="Metrics Enabled"
                    checked={form.values.metricsEnabled}
                    {...form.getInputProps("metricsEnabled", {
                      type: "checkbox",
                    })}
                  />
                </Stack>
              </Paper>
            </Stack>
          </form>
        </div>
      </ScrollArea>
    </Stack>
  );
}
