"use client";

import {
  Stack,
  Group,
  TextInput,
  Button,
  Table,
  Badge,
  ActionIcon,
  Text,
  Skeleton,
  Paper,
  Box,
  Center,
  ThemeIcon,
  Tooltip,
  Collapse,
} from "@mantine/core";
import {
  IconSearch,
  IconPlus,
  IconPencil,
  IconTrash,
  IconShield,
  IconX,
  IconChevronDown,
  IconChevronRight,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useDeleteRole, useGetRoles } from "@/hooks/useRoles";
import { Role } from "@/types/role";
import EditRoleDrawer from "./EditRoleDrawer";
import PermissionsMatrix from "./PermissionsMatrix";
import dayjs from "dayjs";
import classes from "./RolesContainer.module.css";
import { notifications } from "@mantine/notifications";

interface Props {
  workspaceId: string;
}

function RoleRow({
  role,
  onEdit,
  onDelete,
  isDeleting,
}: {
  role: Role;
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
  isDeleting: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const isCustom = !role.is_system;

  return (
    <>
      <Table.Tr
        className={classes.roleRow}
        onClick={() => setExpanded((v) => !v)}
        style={{ cursor: "pointer" }}
      >
        {/* Expand toggle + name */}
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="xs"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded((v) => !v);
              }}
              style={{ flexShrink: 0 }}
            >
              {expanded ? (
                <IconChevronDown size={13} />
              ) : (
                <IconChevronRight size={13} />
              )}
            </ActionIcon>
            <ThemeIcon size="sm" radius="sm" variant="light" color="indigo">
              <IconShield size={12} />
            </ThemeIcon>
            <Text size="sm" fw={500}>
              {role.role_name}
            </Text>
          </Group>
        </Table.Td>

        {/* Description */}
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Text size="sm" c="dimmed" lineClamp={1}>
            {role.description ? (
              role.description
            ) : (
              <Text size="sm" c="dimmed" fs="italic" span>
                No description
              </Text>
            )}
          </Text>
        </Table.Td>

        {/* Type */}
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Badge
            variant="light"
            color={isCustom ? "indigo" : "gray"}
            size="sm"
            radius="sm"
          >
            {isCustom ? "Custom" : "System"}
          </Badge>
        </Table.Td>

        {/* Created */}
        <Table.Td onClick={(e) => e.stopPropagation()}>
          <Text size="xs" c="dimmed">
            {role.created_at
              ? dayjs(role.created_at).format("MMM D, YYYY")
              : "—"}
          </Text>
        </Table.Td>

        {/* Actions */}
        <Table.Td onClick={(e) => e.stopPropagation()}>
          {isCustom && (
            <Group gap={4} justify="flex-end" wrap="nowrap">
              <Tooltip label="Edit role" withArrow position="top" fz="xs">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(role);
                  }}
                >
                  <IconPencil size={14} />
                </ActionIcon>
              </Tooltip>

              <Tooltip label="Delete role" withArrow position="top" fz="xs">
                <ActionIcon
                  variant="subtle"
                  color="red"
                  size="sm"
                  loading={isDeleting}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(role);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Tooltip>
            </Group>
          )}
        </Table.Td>
      </Table.Tr>

      {/* Permissions row — spans full width */}
      {expanded && (
        <Table.Tr style={{ padding: 0 }}>
          <Table.Td colSpan={5} style={{ padding: 0, border: "none" }}>
            <Collapse in={expanded}>
              <PermissionsMatrix roleUuid={role.uuid} />
            </Collapse>
          </Table.Td>
        </Table.Tr>
      )}
    </>
  );
}

export default function RolesContainer({ workspaceId }: Props) {
  const {
    data: roles = [],
    isLoading,
    dataUpdatedAt: roleUpdatedAt,
  } = useGetRoles(workspaceId, true);
  const { mutateAsync: removeRole, isPending: isDeleting } =
    useDeleteRole(workspaceId);
  const [search, setSearch] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const filtered = useMemo(
    () =>
      roles.filter(
        (r: Role) =>
          r.role_name.toLowerCase().includes(search.toLowerCase()) ||
          r.description?.toLowerCase().includes(search.toLowerCase()),
      ),
    [roleUpdatedAt, search],
  );

  const openCreate = () => {
    setSelectedRole(null);
    setDrawerOpen(true);
  };

  const openEdit = (role: Role) => {
    setSelectedRole(role);
    setDrawerOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.is_system) return;

    const confirmed = window.confirm(
      `Delete role "${role.role_name}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await removeRole(role.uuid);
      notifications.show({
        title: "Role deleted",
        message: `"${role.role_name}" has been deleted.`,
        color: "teal",
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to delete role";
      notifications.show({ title: "Error", message, color: "red" });
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
        {/* Header */}
        <Group justify="space-between" align="flex-end">
          <Box>
            <Text size="xs" c="dimmed" tt="uppercase" fw={500} mb={4}>
              Workspace
            </Text>
            <Text fw={700} size="xl">
              Roles
            </Text>
          </Box>
          <Button
            leftSection={<IconPlus size={15} />}
            radius="sm"
            size="sm"
            onClick={openCreate}
          >
            Create Role
          </Button>
        </Group>

        <TextInput
          placeholder="Search roles…"
          leftSection={<IconSearch size={15} />}
          rightSection={
            search ? (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="xs"
                onClick={() => setSearch("")}
              >
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          radius="sm"
          styles={{ input: { fontSize: "var(--mantine-font-size-sm)" } }}
        />

        {/* Table */}
        <Paper withBorder radius="sm" style={{ overflow: "hidden" }}>
          <Table
            horizontalSpacing="md"
            verticalSpacing="sm"
            highlightOnHover
            style={{ tableLayout: "fixed" }}
          >
            <Table.Thead>
              <Table.Tr>
                <Table.Th style={{ width: "25%" }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Name
                  </Text>
                </Table.Th>
                <Table.Th style={{ width: "35%" }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Description
                  </Text>
                </Table.Th>
                <Table.Th style={{ width: "15%" }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Type
                  </Text>
                </Table.Th>
                <Table.Th style={{ width: "18%" }}>
                  <Text size="xs" fw={600} tt="uppercase" c="dimmed">
                    Created
                  </Text>
                </Table.Th>
                <Table.Th style={{ width: "9%" }} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading
                ? skeletonRows
                : filtered.map((role: Role) => (
                    <RoleRow
                      key={role.uuid}
                      role={role}
                      onEdit={openEdit}
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
                  <IconShield size={18} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {search ? "No roles match your search" : "No roles yet"}
                </Text>
                {!search && (
                  <Button
                    variant="subtle"
                    size="xs"
                    radius="sm"
                    onClick={openCreate}
                    leftSection={<IconPlus size={13} />}
                  >
                    Create your first role
                  </Button>
                )}
              </Stack>
            </Center>
          )}
        </Paper>
      </Stack>

      <EditRoleDrawer
        opened={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        workspaceId={workspaceId}
        role={selectedRole}
      />
    </>
  );
}
