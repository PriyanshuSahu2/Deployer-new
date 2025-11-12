import { useState } from "react";
import {
  Container,
  Paper,
  Title,
  Tabs,
  TextInput,
  Button,
  Group,
  Stack,
  Select,
  Textarea,
  Text,
  Card,
  Switch,
  ActionIcon,
  Badge,
  Divider,
  Box,
  Center,
  PasswordInput,
  Alert,
  Grid,
  MantineProvider,
  useMantineColorScheme,
  useComputedColorScheme,
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
  IconCheck,
  IconMoon,
  IconSun,
} from "@tabler/icons-react";

export default function DeploymentConfig() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <DeploymentConfigContent />
    </MantineProvider>
  );
}

function DeploymentConfigContent() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("dark");

  const [activeImportTab, setActiveImportTab] = useState("github");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repos, setRepos] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployTarget, setDeployTarget] = useState("");

  // Form state matching the Go DTOs
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
      build_commands: [""],
      run_commands: [""],
      environment: {},
      port: "",
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

  // Mock repositories and branches
  const mockRepos = {
    github: [
      { value: "https://github.com/user/project-1", label: "user/project-1" },
      { value: "https://github.com/user/project-2", label: "user/project-2" },
      { value: "https://github.com/user/my-app", label: "user/my-app" },
    ],
    bitbucket: [
      {
        value: "https://bitbucket.org/workspace/repo-1",
        label: "workspace/repo-1",
      },
      {
        value: "https://bitbucket.org/workspace/repo-2",
        label: "workspace/repo-2",
      },
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

  const handleConnectProvider = (provider) => {
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
        build_commands: prev.project_config.build_commands.filter(
          (_, i) => i !== index
        ),
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
        run_commands: prev.project_config.run_commands.filter(
          (_, i) => i !== index
        ),
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

  const handleDeploy = () => {
    console.log("Deployment Payload:", JSON.stringify(formData, null, 2));
    alert("Check console for deployment payload!");
  };

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");
  };

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">


        {/* Import Source Section */}
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Group mb="md">
            <IconFolder size={24} color="#228BE6" />
            <Title order={2} size="h3" c={'white'}>
              Import Project Source
            </Title>
          </Group>

          <Tabs value={activeImportTab} onChange={setActiveImportTab}>
            <Tabs.List>
              <Tabs.Tab
                value="zip"
                leftSection={<IconUpload size={16} color="#228BE6" />}
              >
                Zip Folder
              </Tabs.Tab>
              <Tabs.Tab
                value="github"
                leftSection={<IconBrandGithub size={16} color="#24292e" />}
              >
                GitHub
              </Tabs.Tab>
              <Tabs.Tab
                value="bitbucket"
                leftSection={<IconBrandBitbucket size={16} color="#0052CC" />}
              >
                Bitbucket
              </Tabs.Tab>
              <Tabs.Tab
                value="gitlab"
                leftSection={<IconBrandGitlab size={16} color="#FC6D26" />}
              >
                GitLab
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="zip" pt="md">
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  border: "2px dashed #228BE6",
                  borderRadius: "12px",
                  padding: "3rem",
                  textAlign: "center",
                  backgroundColor:
                    computedColorScheme === "dark" ? "#1A1B1E" : "#f0f7ff",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                <Center>
                  <Stack align="center" gap="sm">
                    <IconUpload size={56} stroke={1.5} color="#228BE6" />
                    <Text size="lg" fw={600}>
                      Drag & Drop your ZIP file here
                    </Text>
                    <Text size="sm" c="dimmed">
                      or click to browse files
                    </Text>
                    <Button
                      variant="gradient"
                      gradient={{ from: "blue", to: "cyan" }}
                      mt="md"
                    >
                      Choose File
                    </Button>
                    {formData.zip_config?.file_path && (
                      <Badge
                        color="green"
                        mt="sm"
                        leftSection={<IconCheck size={14} />}
                      >
                        {formData.zip_config.file_path}
                      </Badge>
                    )}
                  </Stack>
                </Center>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="github" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    size="lg"
                    leftSection={<IconBrandGithub size={20} color="#fff" />}
                    loading={loading}
                    onClick={() => handleConnectProvider("github")}
                    variant="gradient"
                    gradient={{ from: "#24292e", to: "#555" }}
                  >
                    Connect GitHub Account
                  </Button>
                ) : (
                  <>
                    <Select
                      label="Select Repository"
                      placeholder="Choose a repository"
                      data={repos}
                      value={selectedRepo}
                      onChange={handleRepoSelect}
                      searchable
                      size="md"
                      leftSection={
                        <IconBrandGithub size={18} color="#24292e" />
                      }
                    />
                    {selectedRepo && (
                      <Select
                        label="Select Branch"
                        placeholder="Choose a branch"
                        data={branches}
                        value={formData.provider_config.branch}
                        onChange={handleBranchSelect}
                        searchable
                        size="md"
                        leftSection={
                          <IconGitBranch size={18} color="#228BE6" />
                        }
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

            <Tabs.Panel value="bitbucket" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    size="lg"
                    leftSection={<IconBrandBitbucket size={20} color="#fff" />}
                    loading={loading}
                    onClick={() => handleConnectProvider("bitbucket")}
                    style={{ backgroundColor: "#0052CC" }}
                  >
                    Connect Bitbucket Account
                  </Button>
                ) : (
                  <>
                    <Select
                      label="Select Repository"
                      placeholder="Choose a repository"
                      data={repos}
                      value={selectedRepo}
                      onChange={handleRepoSelect}
                      searchable
                      size="md"
                      leftSection={
                        <IconBrandBitbucket size={18} color="#0052CC" />
                      }
                    />
                    {selectedRepo && (
                      <Select
                        label="Select Branch"
                        placeholder="Choose a branch"
                        data={branches}
                        value={formData.provider_config.branch}
                        onChange={handleBranchSelect}
                        searchable
                        size="md"
                        leftSection={
                          <IconGitBranch size={18} color="#228BE6" />
                        }
                      />
                    )}
                    <PasswordInput
                      label="Access Token (Optional)"
                      placeholder="Your Bitbucket token"
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

            <Tabs.Panel value="gitlab" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    size="lg"
                    leftSection={<IconBrandGitlab size={20} color="#fff" />}
                    loading={loading}
                    onClick={() => handleConnectProvider("gitlab")}
                    style={{ backgroundColor: "#FC6D26" }}
                  >
                    Connect GitLab Account
                  </Button>
                ) : (
                  <>
                    <Select
                      label="Select Repository"
                      placeholder="Choose a repository"
                      data={repos}
                      value={selectedRepo}
                      onChange={handleRepoSelect}
                      searchable
                      size="md"
                      leftSection={
                        <IconBrandGitlab size={18} color="#FC6D26" />
                      }
                    />
                    {selectedRepo && (
                      <Select
                        label="Select Branch"
                        placeholder="Choose a branch"
                        data={branches}
                        value={formData.provider_config.branch}
                        onChange={handleBranchSelect}
                        searchable
                        size="md"
                        leftSection={
                          <IconGitBranch size={18} color="#228BE6" />
                        }
                      />
                    )}
                    <PasswordInput
                      label="Access Token (Optional)"
                      placeholder="glpat-xxxxxxxxxxxx"
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
          </Tabs>
        </Paper>

        {/* Project Configuration Section */}
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Group mb="md">
            <IconRocket size={24} color="#40C057" />
            <Title order={2} size="h3">
              Project Configuration
            </Title>
          </Group>

          <Stack gap="lg">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Build Output Path"
                  placeholder="dist/ or build/"
                  description="Directory where built files are located"
                  size="md"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_config: {
                        ...prev.project_config,
                        build_path: e.target.value,
                      },
                    }))
                  }
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Application Port"
                  placeholder="3000"
                  description="Port your application runs on"
                  size="md"
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_config: {
                        ...prev.project_config,
                        port: e.target.value,
                      },
                    }))
                  }
                />
              </Grid.Col>
            </Grid>

            <Divider label="Build Commands" labelPosition="center" />

            {formData.project_config.build_commands.map((cmd, index) => (
              <Group key={index} align="flex-end">
                <TextInput
                  label={index === 0 ? "Build Commands" : ""}
                  placeholder="npm run build"
                  style={{ flex: 1 }}
                  value={cmd}
                  onChange={(e) => updateBuildCommand(index, e.target.value)}
                  size="md"
                />
                <ActionIcon
                  color="red"
                  size="lg"
                  variant="subtle"
                  onClick={() => removeBuildCommand(index)}
                  disabled={formData.project_config.build_commands.length === 1}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addBuildCommand}
            >
              Add Build Command
            </Button>

            <Divider label="Run Commands" labelPosition="center" />

            {formData.project_config.run_commands.map((cmd, index) => (
              <Group key={index} align="flex-end">
                <TextInput
                  label={index === 0 ? "Run Commands" : ""}
                  placeholder="npm start"
                  style={{ flex: 1 }}
                  value={cmd}
                  onChange={(e) => updateRunCommand(index, e.target.value)}
                  size="md"
                />
                <ActionIcon
                  color="red"
                  size="lg"
                  variant="subtle"
                  onClick={() => removeRunCommand(index)}
                  disabled={formData.project_config.run_commands.length === 1}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addRunCommand}
            >
              Add Run Command
            </Button>

            <Divider label="Environment Variables" labelPosition="center" />

            {envVars.map((env, index) => (
              <Group key={index} align="flex-end">
                <TextInput
                  label={index === 0 ? "Key" : ""}
                  placeholder="NODE_ENV"
                  style={{ flex: 1 }}
                  value={env.key}
                  onChange={(e) => updateEnvVar(index, "key", e.target.value)}
                  size="md"
                />
                <TextInput
                  label={index === 0 ? "Value" : ""}
                  placeholder="production"
                  style={{ flex: 1 }}
                  value={env.value}
                  onChange={(e) => updateEnvVar(index, "value", e.target.value)}
                  size="md"
                />
                <ActionIcon
                  color="red"
                  size="lg"
                  variant="subtle"
                  onClick={() => removeEnvVar(index)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              </Group>
            ))}
            <Button
              variant="light"
              leftSection={<IconPlus size={16} />}
              onClick={addEnvVar}
            >
              Add Environment Variable
            </Button>

            <Switch
              label="Enable Auto-Deploy"
              description="Automatically deploy on new commits"
              size="md"
              checked={formData.project_config.auto_deploy}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  project_config: {
                    ...prev.project_config,
                    auto_deploy: e.currentTarget.checked,
                  },
                }))
              }
            />
          </Stack>
        </Paper>

        {/* Deploy Target Section */}
        <Paper shadow="md" p="xl" radius="lg" withBorder>
          <Group mb="md">
            <IconCloud size={24} color="#7950F2" />
            <Title order={2} size="h3">
              Deployment Target
            </Title>
          </Group>

          <Stack gap="md">
            <Select
              label="Select Deployment Platform"
              placeholder="Choose where to deploy"
              data={[
                { value: "vps", label: "🖥️ VPS Server (SSH)" },
                { value: "netlify", label: "🌐 Netlify" },
                { value: "vercel", label: "▲ Vercel" },
                { value: "render", label: "🎨 Render" },
              ]}
              value={deployTarget}
              onChange={(value) => {
                setDeployTarget(value);
                setFormData((prev) => ({
                  ...prev,
                  deployment_config: {
                    ...prev.deployment_config,
                    type: value === "vps" ? "ssh" : "token",
                  },
                }));
              }}
              size="md"
              required
            />

            {deployTarget === "vps" && (
              <Card mt="md" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconServer size={20} color="#495057" />
                    <Text fw={600} size="sm">
                      VPS Server Configuration (SSH)
                    </Text>
                  </Group>
                  <Grid>
                    <Grid.Col span={{ base: 12, md: 8 }}>
                      <TextInput
                        label="SSH Host"
                        placeholder="192.168.1.100 or example.com"
                        leftSection={<IconServer size={16} />}
                        required
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deployment_config: {
                              ...prev.deployment_config,
                              ssh_config: {
                                ...prev.deployment_config.ssh_config,
                                host: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, md: 4 }}>
                      <TextInput
                        label="SSH Port"
                        placeholder="22"
                        defaultValue="22"
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            deployment_config: {
                              ...prev.deployment_config,
                              ssh_config: {
                                ...prev.deployment_config.ssh_config,
                                port: e.target.value,
                              },
                            },
                          }))
                        }
                      />
                    </Grid.Col>
                  </Grid>
                  <TextInput
                    label="SSH Username"
                    placeholder="root or ubuntu"
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          ssh_config: {
                            ...prev.deployment_config.ssh_config,
                            username: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <Textarea
                    label="SSH Private Key"
                    placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;MIIEpAIBAAKCAQEA...&#10;-----END RSA PRIVATE KEY-----"
                    minRows={5}
                    leftSection={<IconKey size={16} />}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          ssh_config: {
                            ...prev.deployment_config.ssh_config,
                            private_key: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <PasswordInput
                    label="Passphrase (Optional)"
                    placeholder="Enter passphrase if key is encrypted"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          ssh_config: {
                            ...prev.deployment_config.ssh_config,
                            passphrase: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <Alert
                    icon={<IconInfoCircle size={16} />}
                    color="blue"
                    variant="light"
                  >
                    Make sure your VPS has the necessary ports open and your SSH
                    key is properly configured
                  </Alert>
                </Stack>
              </Card>
            )}

            {deployTarget === "netlify" && (
              <Card mt="md" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconCloud size={20} color="#00C7B7" />
                    <Text fw={600} size="sm">
                      Netlify Configuration
                    </Text>
                  </Group>
                  <PasswordInput
                    label="Access Token"
                    placeholder="nfp_xxxxxxxxxxxxxxxxxxxxx"
                    description="Get your token from Netlify dashboard → User settings → Applications"
                    leftSection={<IconKey size={16} />}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            token: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <TextInput
                    label="API URL (Optional)"
                    placeholder="https://api.netlify.com"
                    defaultValue="https://api.netlify.com"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            api_url: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </Stack>
              </Card>
            )}

            {deployTarget === "vercel" && (
              <Card mt="md" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconCloud size={20} color="#000" />
                    <Text fw={600} size="sm">
                      Vercel Configuration
                    </Text>
                  </Group>
                  <PasswordInput
                    label="Access Token"
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                    description="Get your token from Vercel dashboard → Settings → Tokens"
                    leftSection={<IconKey size={16} />}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            token: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <TextInput
                    label="API URL (Optional)"
                    placeholder="https://api.vercel.com"
                    defaultValue="https://api.vercel.com"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            api_url: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </Stack>
              </Card>
            )}

            {deployTarget === "render" && (
              <Card mt="md" padding="lg" radius="md" withBorder>
                <Stack gap="md">
                  <Group>
                    <IconCloud size={20} color="#7950F2" />
                    <Text fw={600} size="sm">
                      Render Configuration
                    </Text>
                  </Group>
                  <PasswordInput
                    label="API Key"
                    placeholder="rnd_xxxxxxxxxxxxxxxxxxxxx"
                    description="Get your API key from Render dashboard → Account Settings → API Keys"
                    leftSection={<IconKey size={16} />}
                    required
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            token: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                  <TextInput
                    label="API URL (Optional)"
                    placeholder="https://api.render.com"
                    defaultValue="https://api.render.com"
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deployment_config: {
                          ...prev.deployment_config,
                          token_config: {
                            ...prev.deployment_config.token_config,
                            api_url: e.target.value,
                          },
                        },
                      }))
                    }
                  />
                </Stack>
              </Card>
            )}
          </Stack>
        </Paper>

        {/* Deploy Button */}
        <Paper
          p="md"
          withBorder
          radius="lg"
          style={{ backgroundColor: "#f8f9fa" }}
        >
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              Review your configuration and deploy
            </Text>
            <Group>
              <Button variant="default" size="lg">
                Cancel
              </Button>
              <Button
                size="lg"
                leftSection={<IconRocket size={20} />}
                variant="gradient"
                gradient={{ from: "blue", to: "cyan" }}
                onClick={handleDeploy}
              >
                Deploy Project
              </Button>
            </Group>
          </Group>
        </Paper>
      </Stack>
    </Container>
  );
}
