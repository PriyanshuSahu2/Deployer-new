import { useState } from "react";
import {
  Button,
  Group,
  Stack,
  Select,
  TextInput,
  PasswordInput,
  Textarea,
  Text,
  Card,
  Switch,
  ActionIcon,
  Badge,
  Alert,
  Grid,
  Box,
  Center, Tabs,
  Code
} from "@mantine/core";
import {
  IconUpload,
  IconBrandGithub,
  IconBrandBitbucket,
  IconBrandGitlab,
  IconFolder,
  IconServer,
  IconCloud,
  IconKey,
  IconPlus,
  IconTrash,
  IconGitBranch,
  IconInfoCircle,
  IconRocket,
  IconCheck, IconCode
} from "@tabler/icons-react";

export default function DeploymentConfigWizard() {
  const [active, setActive] = useState(0);
  const [activeImportTab, setActiveImportTab] = useState("github");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployTarget, setDeployTarget] = useState("");
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [formData, setFormData] = useState({
    user_id: 1,
    project_type: "web",
    status: "pending",
    provider_type: "",
    provider_config: {
      repo_link: "",
      branch: "",
      access_token: "",
      ssh_key: "",
    },
    zip_config: {
      file_path: "",
    },
    project_config: {
      build_path: "",
      build_commands: ["npm install", "npm run build"],
      run_commands: ["npm start"],
      environment: {},
      port: "3000",
      auto_deploy: false,
    },
    deployment_config: {
      type: "",
      ssh_config: {
        host: "",
        port: "22",
        username: "",
        private_key: "",
        passphrase: "",
      },
      token_config: {
        token: "",
        api_url: "",
        scopes: "",
      },
    },
  });

  const [envVars, setEnvVars] = useState([{ key: "", value: "" }]);

  const mockRepos = {
    github: [
      { value: "https://github.com/user/project-1", label: "user/project-1" },
      { value: "https://github.com/user/project-2", label: "user/project-2" },
      { value: "https://github.com/user/my-app", label: "user/my-app" },
    ],
    bitbucket: [
      { value: "https://bitbucket.org/workspace/repo-1", label: "workspace/repo-1" },
      { value: "https://bitbucket.org/workspace/repo-2", label: "workspace/repo-2" },
    ],
    gitlab: [
      { value: "https://gitlab.com/group/project-a", label: "group/project-a" },
      { value: "https://gitlab.com/group/project-b", label: "group/project-b" },
    ],
  };

  const mockBranches = [
    { value: "main", label: "main" },
    { value: "develop", label: "develop" },
    { value: "staging", label: "staging" },
    { value: "feature/new-ui", label: "feature/new-ui" },
  ];

  const handleConnectProvider = (provider: string) => {
    setLoading(true);
    setTimeout(() => {
      setRepos(mockRepos[provider] || []);
      setFormData((prev) => ({ ...prev, provider_type: provider }));
      setLoading(false);
    }, 800);
  };

  const handleRepoSelect = (repoUrl) => {
    setSelectedRepo(repoUrl);
    setBranches(mockBranches);
    setFormData((prev) => ({
      ...prev,
      provider_config: { ...prev.provider_config, repo_link: repoUrl },
    }));
  };

  const handleBranchSelect = (branch) => {
    setFormData((prev) => ({
      ...prev,
      provider_config: { ...prev.provider_config, branch },
    }));
  };

  const addBuildCommand = () => {
    setFormData((prev) => ({
      ...prev,
      project_config: {
        ...prev.project_config,
        build_commands: [...prev.project_config.build_commands, ""],
      },
    }));
  };

  const updateBuildCommand = (index, value) => {
    const newCommands = [...formData.project_config.build_commands];
    newCommands[index] = value;
    setFormData((prev) => ({
      ...prev,
      project_config: { ...prev.project_config, build_commands: newCommands },
    }));
  };

  const removeBuildCommand = (index) => {
    setFormData((prev) => ({
      ...prev,
      project_config: {
        ...prev.project_config,
        build_commands: prev.project_config.build_commands.filter((_, i) => i !== index),
      },
    }));
  };

  const addRunCommand = () => {
    setFormData((prev) => ({
      ...prev,
      project_config: {
        ...prev.project_config,
        run_commands: [...prev.project_config.run_commands, ""],
      },
    }));
  };

  const updateRunCommand = (index, value) => {
    const newCommands = [...formData.project_config.run_commands];
    newCommands[index] = value;
    setFormData((prev) => ({
      ...prev,
      project_config: { ...prev.project_config, run_commands: newCommands },
    }));
  };

  const removeRunCommand = (index) => {
    setFormData((prev) => ({
      ...prev,
      project_config: {
        ...prev.project_config,
        run_commands: prev.project_config.run_commands.filter((_, i) => i !== index),
      },
    }));
  };

  const addEnvVar = () => {
    setEnvVars([...envVars, { key: "", value: "" }]);
  };

  const updateEnvVar = (index, field, value) => {
    const newEnvVars = [...envVars];
    newEnvVars[index][field] = value;
    setEnvVars(newEnvVars);

    const envObj = {};
    newEnvVars.forEach((env) => {
      if (env.key) envObj[env.key] = env.value;
    });
    setFormData((prev) => ({
      ...prev,
      project_config: { ...prev.project_config, environment: envObj },
    }));
  };

  const removeEnvVar = (index) => {
    const newEnvVars = envVars.filter((_, i) => i !== index);
    setEnvVars(newEnvVars);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        provider_type: "zip",
        zip_config: { file_path: files[0].name },
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.provider_type && (formData.provider_type === 'zip' ? formData.zip_config.file_path : formData.provider_config.repo_link && formData.provider_config.branch);
      case 1:
        return formData.project_config.build_path && formData.project_config.port;
      case 2:
        return deployTarget && (deployTarget === 'vps' ? formData.deployment_config.ssh_config.host && formData.deployment_config.ssh_config.username : formData.deployment_config.token_config.token);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(active)) {
      setCompletedSteps(new Set([...completedSteps, active]));
      setActive((current) => (current < 3 ? current + 1 : current));
    }
  };

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current));

  const handleDeploy = () => {
    console.log("Deployment Payload:", JSON.stringify(formData, null, 2));
    alert("Deployment initiated! Check console for payload.");
  };

  const getProgress = () => {
    return ((completedSteps.size + (validateStep(active) ? 1 : 0)) / 4) * 100;
  };

  // Step 1: Source Selection
  const renderSourceStep = () => (
    <Stack gap="xl">
      <Box>
        <Text size="xl" fw={700} mb="xs">Select Your Project Source</Text>
        <Text size="sm" c="dimmed">Choose how you want to import your project</Text>
      </Box>

      <Tabs value={activeImportTab} onChange={setActiveImportTab}>
        <Tabs.List grow>
          <Tabs.Tab value="github" leftSection={<IconBrandGithub size={16} />}>
            GitHub
          </Tabs.Tab>
          <Tabs.Tab value="bitbucket" leftSection={<IconBrandBitbucket size={16} />}>
            Bitbucket
          </Tabs.Tab>
          <Tabs.Tab value="gitlab" leftSection={<IconBrandGitlab size={16} />}>
            GitLab
          </Tabs.Tab>
          <Tabs.Tab value="zip" leftSection={<IconUpload size={16} />}>
            ZIP Upload
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="github" pt="xl">
          <Stack gap="md">
            {repos.length === 0 ? (
              <Card padding="xl" radius="md" withBorder>
                <Center>
                  <Stack align="center" gap="md">
                    <IconBrandGithub size={48} stroke={1.5} />
                    <Text size="lg" fw={600}>Connect to GitHub</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Authorize access to your GitHub repositories to get started
                    </Text>
                    <Button
                      size="lg"
                      leftSection={<IconBrandGithub size={20} />}
                      loading={loading}
                      onClick={() => handleConnectProvider("github")}
                      variant="filled"
                    >
                      Connect GitHub Account
                    </Button>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <>
                <Select
                  label="Repository"
                  placeholder="Select repository"
                  data={repos}
                  value={selectedRepo}
                  onChange={handleRepoSelect}
                  searchable
                  size="md"
                  leftSection={<IconFolder size={18} />}
                />
                {selectedRepo && (
                  <Select
                    label="Branch"
                    placeholder="Select branch"
                    data={branches}
                    value={formData.provider_config.branch}
                    onChange={handleBranchSelect}
                    searchable
                    size="md"
                    leftSection={<IconGitBranch size={18} />}
                  />
                )}
                <PasswordInput
                  label="Access Token (Optional)"
                  placeholder="ghp_xxxxxxxxxxxx"
                  description="Required for private repositories"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      provider_config: {
                        ...prev.provider_config,
                        access_token: e.target.value,
                      },
                    }))
                  }
                />
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="bitbucket" pt="xl">
          <Stack gap="md">
            {repos.length === 0 ? (
              <Card padding="xl" radius="md" withBorder>
                <Center>
                  <Stack align="center" gap="md">
                    <IconBrandBitbucket size={48} stroke={1.5} />
                    <Text size="lg" fw={600}>Connect to Bitbucket</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Authorize access to your Bitbucket repositories
                    </Text>
                    <Button
                      size="lg"
                      leftSection={<IconBrandBitbucket size={20} />}
                      loading={loading}
                      onClick={() => handleConnectProvider("bitbucket")}
                      style={{ backgroundColor: "#0052CC" }}
                    >
                      Connect Bitbucket
                    </Button>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <>
                <Select
                  label="Repository"
                  placeholder="Select repository"
                  data={repos}
                  value={selectedRepo}
                  onChange={handleRepoSelect}
                  searchable
                  size="md"
                />
                {selectedRepo && (
                  <Select
                    label="Branch"
                    placeholder="Select branch"
                    data={branches}
                    value={formData.provider_config.branch}
                    onChange={handleBranchSelect}
                    searchable
                    size="md"
                  />
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="gitlab" pt="xl">
          <Stack gap="md">
            {repos.length === 0 ? (
              <Card padding="xl" radius="md" withBorder>
                <Center>
                  <Stack align="center" gap="md">
                    <IconBrandGitlab size={48} stroke={1.5} />
                    <Text size="lg" fw={600}>Connect to GitLab</Text>
                    <Text size="sm" c="dimmed" ta="center">
                      Authorize access to your GitLab projects
                    </Text>
                    <Button
                      size="lg"
                      leftSection={<IconBrandGitlab size={20} />}
                      loading={loading}
                      onClick={() => handleConnectProvider("gitlab")}
                      style={{ backgroundColor: "#FC6D26" }}
                    >
                      Connect GitLab
                    </Button>
                  </Stack>
                </Center>
              </Card>
            ) : (
              <>
                <Select
                  label="Repository"
                  placeholder="Select repository"
                  data={repos}
                  value={selectedRepo}
                  onChange={handleRepoSelect}
                  searchable
                  size="md"
                />
                {selectedRepo && (
                  <Select
                    label="Branch"
                    placeholder="Select branch"
                    data={branches}
                    value={formData.provider_config.branch}
                    onChange={handleBranchSelect}
                    searchable
                    size="md"
                  />
                )}
              </>
            )}
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="zip" pt="xl">
          <Box
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            style={{
              border: "2px dashed #228BE6",
              borderRadius: "12px",
              padding: "3rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
          >
            <Center>
              <Stack align="center" gap="md">
                <IconUpload size={56} stroke={1.5} color="#228BE6" />
                <Text size="lg" fw={600}>Drag & Drop ZIP file</Text>
                <Text size="sm" c="dimmed">or click to browse</Text>
                <Button variant="light" mt="md">Choose File</Button>
                {formData.zip_config?.file_path && (
                  <Badge color="green" size="lg" leftSection={<IconCheck size={14} />}>
                    {formData.zip_config.file_path}
                  </Badge>
                )}
              </Stack>
            </Center>
          </Box>
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );

  // Step 2: Build Configuration
  const renderBuildStep = () => (
    <Stack gap="xl">
      <Box>
        <Text size="xl" fw={700} mb="xs">Configure Build Settings</Text>
        <Text size="sm" c="dimmed">Specify how your project should be built and run</Text>
      </Box>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Build Output Directory"
            placeholder="dist/ or build/"
            description="Where your built files will be"
            size="md"
            value={formData.project_config.build_path}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                project_config: { ...prev.project_config, build_path: e.target.value },
              }))
            }
            required
          />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <TextInput
            label="Application Port"
            placeholder="3000"
            description="Port your app listens on"
            size="md"
            value={formData.project_config.port}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                project_config: { ...prev.project_config, port: e.target.value },
              }))
            }
            required
          />
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <IconCode size={20} />
            <Text fw={600}>Build Commands</Text>
          </Group>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addBuildCommand}>
            Add Command
          </Button>
        </Group>
        <Stack gap="xs">
          {formData.project_config.build_commands.map((cmd, index) => (
            <Group key={index} align="center">
              <TextInput
                placeholder="npm run build"
                style={{ flex: 1 }}
                value={cmd}
                onChange={(e) => updateBuildCommand(index, e.target.value)}
                size="sm"
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => removeBuildCommand(index)}
                disabled={formData.project_config.build_commands.length === 1}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Card>

      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <IconRocket size={20} />
            <Text fw={600}>Run Commands</Text>
          </Group>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addRunCommand}>
            Add Command
          </Button>
        </Group>
        <Stack gap="xs">
          {formData.project_config.run_commands.map((cmd, index) => (
            <Group key={index} align="center">
              <TextInput
                placeholder="npm start"
                style={{ flex: 1 }}
                value={cmd}
                onChange={(e) => updateRunCommand(index, e.target.value)}
                size="sm"
              />
              <ActionIcon
                color="red"
                variant="subtle"
                onClick={() => removeRunCommand(index)}
                disabled={formData.project_config.run_commands.length === 1}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Card>

      <Card withBorder padding="lg">
        <Group justify="space-between" mb="md">
          <Group>
            <IconKey size={20} />
            <Text fw={600}>Environment Variables</Text>
          </Group>
          <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={addEnvVar}>
            Add Variable
          </Button>
        </Group>
        <Stack gap="xs">
          {envVars.map((env, index) => (
            <Group key={index} align="center">
              <TextInput
                placeholder="KEY"
                style={{ flex: 1 }}
                value={env.key}
                onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                size="sm"
              />
              <TextInput
                placeholder="value"
                style={{ flex: 1 }}
                value={env.value}
                onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                size="sm"
              />
              <ActionIcon color="red" variant="subtle" onClick={() => removeEnvVar(index)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Card>

      <Switch
        label="Enable Auto-Deploy on Push"
        description="Automatically deploy when new commits are pushed"
        size="md"
        checked={formData.project_config.auto_deploy}
        onChange={(e) =>
          setFormData((prev) => ({
            ...prev,
            project_config: { ...prev.project_config, auto_deploy: e.currentTarget.checked },
          }))
        }
      />
    </Stack>
  );

  // Step 3: Deployment Target
  const renderDeploymentStep = () => (
    <Stack gap="xl">
      <Box>
        <Text size="xl" fw={700} mb="xs">Choose Deployment Platform</Text>
        <Text size="sm" c="dimmed">Select where you want to deploy your application</Text>
      </Box>

      <Grid>
        {[
          { value: "vps", label: "VPS Server", icon: IconServer, color: "#495057", desc: "Deploy to your own server via SSH" },
          { value: "netlify", label: "Netlify", icon: IconCloud, color: "#00C7B7", desc: "Deploy to Netlify's global CDN" },
          { value: "vercel", label: "Vercel", icon: IconCloud, color: "#000", desc: "Deploy to Vercel platform" },
          { value: "render", label: "Render", icon: IconCloud, color: "#7950F2", desc: "Deploy to Render cloud" },
        ].map((platform) => {
          const Icon = platform.icon;
          return (
            <Grid.Col key={platform.value} span={{ base: 12, sm: 6 }}>
              <Card
                padding="lg"
                radius="md"
                withBorder
                style={{
                  cursor: "pointer",
                  border: deployTarget === platform.value ? `2px solid ${platform.color}` : undefined,
                  backgroundColor: deployTarget === platform.value ? "rgba(34, 139, 230, 0.05)" : undefined,
                }}
                onClick={() => {
                  setDeployTarget(platform.value);
                  setFormData((prev) => ({
                    ...prev,
                    deployment_config: {
                      ...prev.deployment_config,
                      type: platform.value === "vps" ? "ssh" : "token",
                    },
                  }));
                }}
              >
                <Stack align="center" gap="sm">
                  <Icon size={40} color={platform.color} />
                  <Text fw={600} size="lg">{platform.label}</Text>
                  <Text size="xs" c="dimmed" ta="center">{platform.desc}</Text>
                  {deployTarget === platform.value && (
                    <Badge color="green" leftSection={<IconCheck size={12} />}>
                      Selected
                    </Badge>
                  )}
                </Stack>
              </Card>
            </Grid.Col>
          );
        })}
      </Grid>

      {deployTarget === "vps" && (
        <Card withBorder padding="lg">
          <Stack gap="md">
            <Group>
              <IconServer size={20} />
              <Text fw={600}>SSH Configuration</Text>
            </Group>
            <Grid>
              <Grid.Col span={{ base: 12, md: 8 }}>
                <TextInput
                  label="Host"
                  placeholder="192.168.1.100 or example.com"
                  required
                  value={formData.deployment_config.ssh_config.host}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deployment_config: {
                        ...prev.deployment_config,
                        ssh_config: { ...prev.deployment_config.ssh_config, host: e.target.value },
                      },
                    }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <TextInput
                  label="Port"
                  placeholder="22"
                  value={formData.deployment_config.ssh_config.port}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deployment_config: {
                        ...prev.deployment_config,
                        ssh_config: { ...prev.deployment_config.ssh_config, port: e.target.value },
                      },
                    }))
                  }
                />
              </Grid.Col>
            </Grid>
            <TextInput
              label="Username"
              placeholder="root or ubuntu"
              required
              value={formData.deployment_config.ssh_config.username}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deployment_config: {
                    ...prev.deployment_config,
                    ssh_config: { ...prev.deployment_config.ssh_config, username: e.target.value },
                  },
                }))
              }
            />
            <Textarea
              label="SSH Private Key"
              placeholder="-----BEGIN RSA PRIVATE KEY-----"
              minRows={4}
              required
              value={formData.deployment_config.ssh_config.private_key}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deployment_config: {
                    ...prev.deployment_config,
                    ssh_config: { ...prev.deployment_config.ssh_config, private_key: e.target.value },
                  },
                }))
              }
            />
            <PasswordInput
              label="Passphrase (Optional)"
              placeholder="Enter if key is encrypted"
              value={formData.deployment_config.ssh_config.passphrase}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deployment_config: {
                    ...prev.deployment_config,
                    ssh_config: { ...prev.deployment_config.ssh_config, passphrase: e.target.value },
                  },
                }))
              }
            />
          </Stack>
        </Card>
      )}

      {deployTarget && deployTarget !== "vps" && (
        <Card withBorder padding="lg">
          <Stack gap="md">
            <Group>
              <IconKey size={20} />
              <Text fw={600}>{deployTarget.charAt(0).toUpperCase() + deployTarget.slice(1)} Configuration</Text>
            </Group>
            <PasswordInput
              label="Access Token"
              placeholder="Enter your API token"
              description={`Get from ${deployTarget} dashboard`}
              required
              value={formData.deployment_config.token_config.token}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deployment_config: {
                    ...prev.deployment_config,
                    token_config: { ...prev.deployment_config.token_config, token: e.target.value },
                  },
                }))
              }
            />
          </Stack>
        </Card>
      )}

      {deployTarget && (
        <Alert icon={<IconInfoCircle size={16} />} color="blue" variant="light">
          Your deployment credentials are encrypted and stored securely
        </Alert>
      )}
    </Stack>
  );

  // Step 4: Review & Deploy
  const renderReviewStep = () => (
    <Stack gap="xl">
      <Box>
        <Text size="xl" fw={700} mb="xs">Review Configuration</Text>
        <Text size="sm" c="dimmed">Review your settings before deploying</Text>
      </Box>

      <Card withBorder padding="lg">
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Source</Text>
            <Badge color="blue">{formData.provider_type || "Not selected"}</Badge>
          </Group>
          {formData.provider_config.repo_link && (
            <Box>
              <Text size="sm" c="dimmed">Repository</Text>
              <Code block>{formData.provider_config.repo_link}</Code>
              <Text size="sm" c="dimmed" mt="xs">Branch: {formData.provider_config.branch}</Text>
            </Box>
          )}
        </Stack>
      </Card>

      <Card withBorder padding="lg">
        <Text fw={600} mb="md">Build Configuration</Text>
        <Stack gap="xs">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Build Path</Text>
            <Text size="sm">{formData.project_config.build_path || "Not set"}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Port</Text>
            <Text size="sm">{formData.project_config.port}</Text>
          </Group>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">Auto-Deploy</Text>
            <Badge color={formData.project_config.auto_deploy ? "green" : "gray"}>
              {formData.project_config.auto_deploy ? "Enabled" : "Disabled"}
            </Badge>
          </Group>
          <Box>
            <Text size="sm" c="dimmed" mb="xs">Build Commands</Text>
            <Stack gap={4}>
              {formData.project_config.build_commands.map((cmd, i) => (
                <Code key={i}>{cmd || "Empty command"}</Code>
              ))}

            </Stack>
          </Box>
        </Stack>
      </Card>
    </Stack>
  )

  return (<>
    <Stack>
      {renderSourceStep()}

      {renderBuildStep()}

      {renderDeploymentStep()}

      {renderReviewStep()}
    </Stack>
  </>)
}