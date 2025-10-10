import React, { useEffect, useState } from "react";
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
  Badge,
  rem,
  Center,
  Box,
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
} from "@tabler/icons-react";
import { privateRequest } from "../../config/requestMethod";

export default function DeploymentConfig() {
  const [activeImportTab, setActiveImportTab] = useState("zip");
  const [selectedRepo, setSelectedRepo] = useState("");
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployTarget, setDeployTarget] = useState("");

  // Mock repositories data
  const mockRepos = {
    github: [
      { value: "user/project-1", label: "project-1", stars: 45 },
      { value: "user/project-2", label: "project-2", stars: 23 },
      { value: "user/my-app", label: "my-app", stars: 102 },
    ],
    bitbucket: [
      { value: "workspace/repo-1", label: "repo-1" },
      { value: "workspace/repo-2", label: "repo-2" },
      { value: "workspace/api-service", label: "api-service" },
    ],
    gitlab: [
      { value: "group/project-a", label: "project-a" },
      { value: "group/project-b", label: "project-b" },
      { value: "group/frontend-app", label: "frontend-app" },
    ],
  };

  useEffect(() => {
    privateRequest
      .get("/project/github/repo")
      .then((res) => console.log(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleConnectProvider = (provider) => {
    try {
      const REDIRECT_URI = `${window.location.origin}/auth/github/callback`;

      const userId = "3";
      const stateData = {
        uuid: crypto.randomUUID(),
        userId: userId,
      };

      const oAuthUrl =
        import.meta.env.VITE_GITHUB_OAUTH_URL +
        `?client_id=${
          import.meta.env.VITE_GITHUB_CLIENT_ID
        }&redirect_uri=${REDIRECT_URI}&scope=user%20repo&state=${encodeURIComponent(
          JSON.stringify(stateData)
        )}`;

      window.location.href = oAuthUrl;
    } catch (error) {}
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Dropped file:", files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        Deploy Your Project
      </Title>

      <Stack gap="xs">
        {/* Import Source Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Import Project
          </Title>

          <Tabs value={activeImportTab} onChange={setActiveImportTab}>
            <Tabs.List>
              <Tabs.Tab
                value="github"
                leftSection={<IconBrandGithub size={20} color="#24292e" />}
              >
                GitHub
              </Tabs.Tab>
              <Tabs.Tab
                value="bitbucket"
                leftSection={<IconBrandBitbucket size={20} color="#0052CC" />}
              >
                Bitbucket
              </Tabs.Tab>
              <Tabs.Tab
                value="gitlab"
                leftSection={<IconBrandGitlab size={20} color="#FC6D26" />}
              >
                GitLab
              </Tabs.Tab>
              <Tabs.Tab
                value="zip"
                leftSection={<IconUpload size={20} color="#228BE6" />}
              >
                Zip Folder
              </Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="zip" pt="md">
              <Box
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                style={{
                  border: "2px dashed #dee2e6",
                  borderRadius: "8px",
                  padding: "3rem",
                  textAlign: "center",
                  backgroundColor: "#f8f9fa",
                  cursor: "pointer",
                }}
              >
                <Center>
                  <Stack align="center" gap="sm">
                    <IconUpload size={48} stroke={1.5} color="#868e96" />
                    <Text size="lg" fw={500}>
                      Drag & Drop your ZIP file here
                    </Text>
                    <Text size="sm" c="dimmed">
                      or click to browse
                    </Text>
                    <Button variant="light" mt="sm">
                      Choose File
                    </Button>
                  </Stack>
                </Center>
              </Box>
            </Tabs.Panel>

            <Tabs.Panel value="github" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    leftSection={<IconBrandGithub size={20} color="#24292e" />}
                    loading={loading}
                    onClick={() => handleConnectProvider("github")}
                  >
                    Connect GitHub Account
                  </Button>
                ) : (
                  <Select
                    label="Select Repository"
                    placeholder="Choose a repository"
                    data={repos}
                    value={selectedRepo}
                    onChange={setSelectedRepo}
                    searchable
                  />
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="bitbucket" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    leftSection={
                      <IconBrandBitbucket size={20} color="#0052CC" />
                    }
                    loading={loading}
                    onClick={() => handleConnectProvider("bitbucket")}
                  >
                    Connect Bitbucket Account
                  </Button>
                ) : (
                  <Select
                    label="Select Repository"
                    placeholder="Choose a repository"
                    data={repos}
                    value={selectedRepo}
                    onChange={setSelectedRepo}
                    searchable
                  />
                )}
              </Stack>
            </Tabs.Panel>

            <Tabs.Panel value="gitlab" pt="md">
              <Stack gap="md">
                {repos.length === 0 ? (
                  <Button
                    leftSection={<IconBrandGitlab size={20} color="#FC6D26" />}
                    loading={loading}
                    onClick={() => handleConnectProvider("gitlab")}
                  >
                    Connect GitLab Account
                  </Button>
                ) : (
                  <Select
                    label="Select Repository"
                    placeholder="Choose a repository"
                    data={repos}
                    value={selectedRepo}
                    onChange={setSelectedRepo}
                    searchable
                  />
                )}
              </Stack>
            </Tabs.Panel>
          </Tabs>
        </Paper>

        {/* Project Configuration Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Project Configuration
          </Title>

          <Stack gap="md">
            <TextInput
              label="Project Name"
              placeholder="my-awesome-project"
              required
              leftSection={<IconFolder size={16} />}
            />

            <TextInput
              label="Build Path"
              placeholder="dist/"
              description="The directory where your built files are located"
            />

            <Textarea
              label="Custom Commands"
              placeholder="npm install && npm run custom-script"
              description="Custom commands to run before build"
              minRows={3}
            />

            <TextInput
              label="Build Command"
              placeholder="npm run build"
              description="Command to build your project"
            />
          </Stack>
        </Paper>

        {/* Deploy Target Section */}
        <Paper shadow="sm" p="xl" radius="md" withBorder>
          <Title order={2} size="h3" mb="md">
            Deploy Target
          </Title>

          <Select
            label="Select Deployment Platform"
            placeholder="Choose where to deploy"
            data={[
              { value: "vps", label: "VPS Server" },
              { value: "netlify", label: "Netlify" },
              { value: "vercel", label: "Vercel" },
              { value: "render", label: "Render" },
            ]}
            value={deployTarget}
            onChange={setDeployTarget}
            required
          />

          {deployTarget === "vps" && (
            <Card mt="md" padding="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500} size="sm">
                  VPS Server Configuration
                </Text>
                <TextInput
                  label="SSH Host"
                  placeholder="192.168.1.100"
                  leftSection={<IconServer size={16} />}
                />
                <TextInput
                  label="SSH Port"
                  placeholder="22"
                  defaultValue="22"
                />
                <TextInput label="SSH Username" placeholder="root" />
                <Textarea
                  label="SSH Private Key"
                  placeholder="-----BEGIN RSA PRIVATE KEY-----"
                  minRows={4}
                  leftSection={<IconKey size={16} />}
                />
              </Stack>
            </Card>
          )}

          {deployTarget === "netlify" && (
            <Card mt="md" padding="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500} size="sm">
                  Netlify Configuration
                </Text>
                <TextInput
                  label="Access Token"
                  placeholder="nfp_xxxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  leftSection={<IconCloud size={16} />}
                  description="Get your token from Netlify dashboard"
                />
              </Stack>
            </Card>
          )}

          {deployTarget === "vercel" && (
            <Card mt="md" padding="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500} size="sm">
                  Vercel Configuration
                </Text>
                <TextInput
                  label="Access Token"
                  placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  leftSection={<IconCloud size={16} />}
                  description="Get your token from Vercel settings"
                />
              </Stack>
            </Card>
          )}

          {deployTarget === "render" && (
            <Card mt="md" padding="md" radius="md" withBorder>
              <Stack gap="md">
                <Text fw={500} size="sm">
                  Render Configuration
                </Text>
                <TextInput
                  label="API Key"
                  placeholder="rnd_xxxxxxxxxxxxxxxxxxxxx"
                  type="password"
                  leftSection={<IconCloud size={16} />}
                  description="Get your API key from Render dashboard"
                />
              </Stack>
            </Card>
          )}
        </Paper>

        {/* Deploy Button */}
        <Group justify="flex-end">
          <Button variant="default" size="lg">
            Cancel
          </Button>
          <Button size="lg" leftSection={<IconCloud size={20} />}>
            Deploy Project
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
