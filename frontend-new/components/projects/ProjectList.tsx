'use client';

import {
  Stack,
  Group,
  TextInput,
  Button,
  Table,
  ActionIcon,
  Text,
  Skeleton,
  Paper,
  Box,
  Center,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconPencil,
  IconServerBolt,
  IconTrash,
  IconFolder,
  IconX,
  IconEye,
} from '@tabler/icons-react';
import { useMemo, useState } from 'react';
import { useDeleteProject, useGetProjects } from '@/hooks/useProjects';
import { Project } from '@/types/project';
import EditProjectDrawer from './EditProjectDrawer';

import dayjs from 'dayjs';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';

interface Props {
  workspaceId: string;
}

function ProjectRow({
  project,
  onEdit,
  onViewProject,
  onDelete,
  isDeleting,
}: {
  project: Project;
  onEdit: (project: Project) => void;
  onViewProject: (project: Project) => void;
  onDelete: (project: Project) => void;
  isDeleting: boolean;
}) {
  return (
    <Table.Tr>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size="sm" radius="sm" variant="light" color="indigo">
            <IconFolder size={12} />
          </ThemeIcon>

          <Text size="sm" fw={500}>
            {project.name}
          </Text>
        </Group>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={1}>
          {project.description || (
            <Text span fs="italic" c="dimmed">
              No description
            </Text>
          )}
        </Text>
      </Table.Td>

      <Table.Td>
        <Text size="sm" c="dimmed">
          {project.framework || '—'}
        </Text>
      </Table.Td>

      {/* Created */}
      <Table.Td>
        <Text size="sm" c="dimmed">
          {project.created_at
            ? dayjs(project.created_at).format('MMM D, YYYY')
            : '—'}
        </Text>
      </Table.Td>

      <Table.Td>
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Tooltip label="View project" withArrow position="top" fz="xs">
            <ActionIcon
              variant="subtle"
              color="indigo"
              size="sm"
              onClick={() => onViewProject(project)}
            >
              <IconEye size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Edit project" withArrow position="top" fz="xs">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={() => onEdit(project)}
            >
              <IconPencil size={18} />
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Delete project" withArrow position="top" fz="xs">
            <ActionIcon
              variant="subtle"
              color="red"
              size="sm"
              loading={isDeleting}
              onClick={() => onDelete(project)}
            >
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

export default function ProjectList({ workspaceId }: Props) {
  const router = useRouter();
  const { data: projects = [], isLoading } = useGetProjects(workspaceId, true);

  const { mutateAsync: removeProject, isPending: isDeleting } =
    useDeleteProject(workspaceId);

  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filtered = useMemo(
    () =>
      projects.filter(
        (p: Project) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.description?.toLowerCase().includes(search.toLowerCase()),
      ),
    [projects, search],
  );

  const openCreate = () => {
    setSelectedProject(null);
    setDrawerOpen(true);
  };

  const openEdit = (project: Project) => {
    setSelectedProject(project);
    setDrawerOpen(true);
  };

  const handleViewProject = (project: Project) => {
    router.push(
      `/app/${workspaceId}/projects/${encodeURIComponent(project.uuid)}`,
    );``
  };

  const handleDelete = async (project: Project) => {
    const confirmed = window.confirm(
      `Delete project "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    try {
      await removeProject(project.uuid);

      notifications.show({
        title: 'Project deleted',
        message: `"${project.name}" has been deleted.`,
        color: 'teal',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to delete project';

      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  const skeletonRows = Array.from({ length: 4 }).map((_, i) => (
    <Table.Tr key={i}>
      {Array.from({ length: 5 }).map((__, j) => (
        <Table.Td key={j}>
          <Skeleton height={14} radius="sm" />
        </Table.Td>
      ))}
    </Table.Tr>
  ));

  return (
    <>
      <Stack gap="lg" p="md">
        <Group justify="space-between" align="flex-end">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
              Workspace
            </Text>

            <Text fw={700} size="xl">
              Projects
            </Text>
          </Box>

          <Button
            leftSection={<IconPlus size={15} />}
            radius="sm"
            size="sm"
            onClick={openCreate}
          >
            Create Project
          </Button>
        </Group>

        <TextInput
          placeholder="Search projects…"
          leftSection={<IconSearch size={15} />}
          rightSection={
            search ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xs"
                onClick={() => setSearch('')}
              >
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="sm"
        />

        <Paper withBorder radius="sm" style={{ overflow: 'hidden' }}>
          <Table
            horizontalSpacing="md"
            verticalSpacing="sm"
            highlightOnHover
            style={{ tableLayout: 'fixed' }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: '25%' }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Name
                  </Text>
                </Table.Th>

                <Table.Th style={{ width: '35%' }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Description
                  </Text>
                </Table.Th>

                <Table.Th style={{ width: '20%' }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Framework
                  </Text>
                </Table.Th>

                <Table.Th style={{ width: '15%' }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Created
                  </Text>
                </Table.Th>

                <Table.Th style={{ width: '5%' }} />
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {isLoading
                ? skeletonRows
                : filtered.map((project: Project) => (
                    <ProjectRow
                      key={project.uuid}
                      project={project}
                      onEdit={openEdit}
                      onViewProject={handleViewProject}
                      onDelete={handleDelete}
                      isDeleting={isDeleting}
                    />
                  ))}
            </Table.Tbody>
          </Table>

          {!isLoading && filtered.length === 0 && (
            <Center py="xl">
              <Stack align="center" gap="xs">
                <ThemeIcon size="lg" radius="md" variant="light" color="gray">
                  <IconFolder size={18} />
                </ThemeIcon>

                <Text size="sm" c="dimmed">
                  {search
                    ? 'No projects match your search'
                    : 'No projects yet'}
                </Text>

                {!search && (
                  <Button
                    variant="subtle"
                    size="xs"
                    radius="sm"
                    onClick={openCreate}
                    leftSection={<IconPlus size={13} />}
                  >
                    Create your first project
                  </Button>
                )}
              </Stack>
            </Center>
          )}
        </Paper>
      </Stack>

      <EditProjectDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workspaceId={workspaceId}
        project={selectedProject}
      />
    </>
  );
}
