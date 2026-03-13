"use client";

import { useGetProjectDetails } from "@/hooks/useProjects";
import { Select, Avatar, TextInput, Text, Group, Menu, UnstyledButton, Box, Button, Divider } from "@mantine/core";
import { IconSearch, IconChevronDown, IconPlus } from "@tabler/icons-react";
import { modals } from "@mantine/modals";
import CreateEnvironmentModal from "../modals/CreateEnvironmentModal";
import { useEffect, useMemo, useState } from "react";
import { Environment } from "@/types/environment";
import ServiceList from "../services/ServiceList";

const ProjectDetails = ({ workspaceId, projectId }: { workspaceId: string, projectId: string }) => {

  const { data: project, isLoading } = useGetProjectDetails(workspaceId, projectId, true);


  const environments = useMemo(() => project?.environments || [], [project]);

  const [activeEnv, setActiveEnv] = useState<Environment>(environments?.[0]);


  useEffect(() => {
    setActiveEnv(environments?.[0]);
  }, [environments]);

  const handleOpenNewEnvironmentModal = () => {
    modals.open({
      title: "Create New Environment",
      children: <CreateEnvironmentModal onSubmit={(name) => {
        null;
      }} />
    });
  };
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-gray-500">{project?.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Group gap="xs">
            <Text size="xs" fw={600} c="dimmed" tt="uppercase">Environment</Text>
            <Menu shadow="xl" width={220} radius="md" position="bottom-end" transitionProps={{ transition: 'pop-top-right' }}>
              <Menu.Target>
                <Button variant="outline" size="sm" gradient={{ from: 'blue', to: 'cyan' }}>
                  <Group gap="sm">
                    <Box className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                    <Text size="sm" fw={600}>{activeEnv?.name || "Select Environment"}</Text>
                    <IconChevronDown size={14} className="text-gray-400" />
                  </Group>
                </Button>
              </Menu.Target>

              <Menu.Dropdown p={4}>
                <Menu.Label>Switch Environment</Menu.Label>
                {environments.map((env) => (
                  <Menu.Item
                    onClick={() => setActiveEnv(env)}
                    leftSection={<Box className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                  >
                    {env.name}
                  </Menu.Item>
                ))}
                <Menu.Divider />

                <Menu.Item
                  color="indigo"
                  onClick={handleOpenNewEnvironmentModal}
                  leftSection={<IconPlus size={15} />}
                >
                  Add New Environment
                </Menu.Item>
                <Menu.Divider />

              </Menu.Dropdown>
            </Menu>
          </Group>
        </div>
      </div>
      <Divider w={"full"} title="Services" />
      <ServiceList workspaceId={workspaceId} projectId={projectId} />
    </div>
  );
};

export default ProjectDetails;
