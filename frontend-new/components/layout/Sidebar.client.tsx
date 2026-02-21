"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Popover,
  ScrollArea,
  Stack,
  Text,
  UnstyledButton,
  useComputedColorScheme,
  useMantineTheme,
} from "@mantine/core";
import {
  IconChevronDown,
  IconLayoutDashboard,
  IconFolders,
  IconRocket,
  IconVariable,
  IconServer,
  IconWorld,
  IconFileText,
  IconHistory,
  IconGitBranch,
  IconPlugConnected,
  IconUsers,
  IconSettings,
  IconCreditCard,
  IconBook,
  IconSelector,
  IconCheck,
  IconUserPlus,
  IconPlus,
} from "@tabler/icons-react";
import { useGetUserWorkspace } from "@/hooks/useWorkspace";
import { modals } from "@mantine/modals";
import CreateWorkspaceModal from "../modals/CreateWorkspaceModal";
import InviteMemberModal from "../modals/InviteMemberModal";
import { useRouter } from "next/navigation";

interface NavItem {
  icon: any;
  label: string;
  href: string;
}

interface NavGroupType {
  label: string;
  items: NavItem[];
}

const navigationGroups: NavGroupType[] = [
  {
    label: "Core",
    items: [
      { icon: IconLayoutDashboard, label: "Overview", href: "/app/:workspaceId/overview" },
      { icon: IconFolders, label: "Projects", href: "/app/:workspaceId/projects" },
      { icon: IconRocket, label: "Deployments", href: "/app/:workspaceId/deployments" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { icon: IconVariable, label: "Environments", href: "/app/:workspaceId/environments" },
      { icon: IconServer, label: "Servers / Infra", href: "/app/:workspaceId/servers" },
      { icon: IconWorld, label: "Domains", href: "/app/:workspaceId/domains" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { icon: IconFileText, label: "Logs", href: "/app/:workspaceId/logs" },
      { icon: IconHistory, label: "Activity / Audit", href: "/app/:workspaceId/activity" },
    ],
  },
  {
    label: "Automation",
    items: [
      { icon: IconGitBranch, label: "CI / CD", href: "/app/:workspaceId/cicd" },
      { icon: IconPlugConnected, label: "Integrations", href: "/app/:workspaceId/integrations" },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: IconUsers, label: "Members", href: "/app/:workspaceId/members" },
      { icon: IconBook, label: "Roles", href: "/app/:workspaceId/roles" },
      { icon: IconSettings, label: "Workspace Settings", href: "/app/:workspaceId/settings" },
      { icon: IconCreditCard, label: "Billing & Usage", href: "/app/:workspaceId/billing" },
    ],
  },
];

function NavButton({ icon: Icon, label, href }: NavItem) {
  const pathname = usePathname();
  const theme = useMantineTheme();
  const params = useParams();

  const resolvedHref = href.replace(":workspaceId", params.workspaceId as string);
  const active = pathname === resolvedHref;
  const primary = theme.colors[theme.primaryColor][6];
  const colorScheme = useComputedColorScheme("light");
  const isDark = colorScheme === "dark";
  return (
    <UnstyledButton
      component={Link}
      href={resolvedHref}
      style={{
        display: "flex",
        alignItems: "center",
        gap: theme.spacing.sm,
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        borderRadius: theme.radius.md,
        backgroundColor: active ? primary : "transparent",
        transition: "background-color 150ms ease",
        textDecoration: "none",
        width: "100%",
      }}
    >
      <Icon
        size={18}
        stroke={1.5}
        style={{ color: active ? theme.white : isDark ? theme.colors.gray[0] : theme.colors.gray[7] }}
      />
      <Text
        size="sm"
        fw={500}
        truncate
        style={{ color: active ? theme.white : isDark ? theme.colors.gray[0] : theme.colors.gray[7] }}
      >
        {label}
      </Text>
    </UnstyledButton>
  );
}

function NavGroup({ label, items }: NavGroupType) {
  const [opened, setOpened] = useState(true);
  const theme = useMantineTheme();
  const primary = theme.colors[theme.primaryColor][6];
  const colorScheme = useComputedColorScheme("light");
  const isDark = colorScheme === "dark";
  return (
    <Box>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        style={{
          display: "flex",
          width: "100%",
          alignItems: "center",
          justifyContent: "space-between",
          padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
          borderRadius: theme.radius.md,
        }}
      >
        <Text
          size="xs"
          fw={700}
          style={{ color: primary, textTransform: "uppercase", letterSpacing: "0.05em" }}
        >
          {label}
        </Text>
        <IconChevronDown
          size={14}
          style={{
            color: primary,
            transform: opened ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 300ms ease",
          }}
        />
      </UnstyledButton>

      <Collapse in={opened}>
        <Stack gap={4} mt={4}>
          {items.map((item, index) => (
            <NavButton key={index} {...item} />
          ))}
        </Stack>
      </Collapse>
    </Box>
  );
}

interface Workspace {
  name: string;
  created_at: Date;
  updated_at: Date;
  uuid: string;
}

function WorkspaceSwitcher({
  onNewWorkspace,
  workspaces = [],
  onInviteMembers,
  onWorkspaceChange,
}: {
  workspaces?: Workspace[];
  onNewWorkspace?: () => void;
  onInviteMembers?: () => void;
  onWorkspaceChange?: (workspace: Workspace) => void;
}) {
  const theme = useMantineTheme();
  const params = useParams();
  const [popoverOpened, setPopoverOpened] = useState(false);
    const colorScheme = useComputedColorScheme("light");
  const isDark = colorScheme === "dark";

  const currentWorkspace = params.workspaceId as string;
  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][0];

  const selectedWorkspace = useMemo(
    () =>
      Array.isArray(workspaces)
        ? workspaces.find((ws) => ws.uuid === currentWorkspace)
        : undefined,
    [workspaces, currentWorkspace]
  );

  return (
    <Popover
      width={280}
      position="bottom-start"
      shadow="md"
      opened={popoverOpened}
      onChange={setPopoverOpened}
    >
      <Popover.Target>
        <UnstyledButton
          onClick={() => setPopoverOpened((o) => !o)}
          style={{
            width: "100%",
            padding: theme.spacing.md,
            borderBottom: `1px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`,
            transition: "background-color 150ms ease",
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={700}>
                {selectedWorkspace?.name || "Select workspace"}
              </Text>
              <Text size="xs" c={theme.primaryColor}>
                Switch workspace
              </Text>
            </Box>
            <IconSelector size={18} stroke={1.5} color={theme.colors.gray[6]} />
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown p="xs">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" px="xs" pt={4}>
            WORKSPACES
          </Text>

          {Array.isArray(workspaces) &&
            workspaces.map((workspace) => {
              const isActive = workspace.uuid === currentWorkspace;
              return (
                <UnstyledButton
                  key={workspace.uuid}
                  onClick={() => {
                    onWorkspaceChange?.(workspace);
                    setPopoverOpened(false);
                  }}
                  style={{
                    width: "100%",
                    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                    borderRadius: theme.radius.md,
                    backgroundColor: isActive ? primaryLight : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background-color 150ms ease",
                  }}
                >
                  <Text size="sm" fw={isActive ? 600 : 400}>
                    {workspace.name}
                  </Text>
                  {isActive && (
                    <IconCheck size={16} stroke={2} style={{ color: primary }} />
                  )}
                </UnstyledButton>
              );
            })}

          <Divider my="xs" />

          <Button
            variant="light"
            color={theme.primaryColor}
            size="sm"
            fullWidth
            onClick={() => {
              setPopoverOpened(false);
              onInviteMembers?.();
            }}
            leftSection={<IconUserPlus size={16} />}
            justify="flex-start"
          >
            Invite Members
          </Button>

          <Button
            variant="subtle"
            color="gray"
            size="sm"
            fullWidth
            onClick={() => {
              setPopoverOpened(false);
              onNewWorkspace?.();
            }}
            leftSection={<IconPlus size={16} />}
            justify="flex-start"
          >
            Add New Workspace
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

export default function Sidebar() {
  const theme = useMantineTheme();
  const { data: workspaces } = useGetUserWorkspace(true);
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useComputedColorScheme("light");
  const isDark = colorScheme === "dark";

  const openCreateWorkspaceModal = () => {
    modals.open({
      title: "Create workspace",
      size: "md",
      children: <CreateWorkspaceModal />,
    });
  };

  const openInviteMembersModal = () => {
    modals.open({
      title: "Invite members",
      size: "lg",
      children: <InviteMemberModal />,
    });
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    const segments = pathname.split("/");
    segments[2] = workspace.uuid;
    router.replace(segments.join("/"));
  };

  return (
    <Box
      style={{
        width: 256,
        height: "100vh",
        borderRight: `1px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`,

        display: "flex",
        flexDirection: "column",
      }}
    >
      <WorkspaceSwitcher
        workspaces={workspaces}
        onInviteMembers={openInviteMembersModal}
        onNewWorkspace={openCreateWorkspaceModal}
        onWorkspaceChange={handleWorkspaceChange}
      />

      <ScrollArea flex={1} p="sm">
        <Stack gap="sm">
          {navigationGroups.map((group, index) => (
            <NavGroup key={index} {...group} />
          ))}
        </Stack>
      </ScrollArea>

      <Box
        style={{
          borderTop: `1px solid ${isDark ? theme.colors.gray[7] : theme.colors.gray[3]}`,
          padding: theme.spacing.sm,
        }}
      >
        <NavButton icon={IconBook} label="Docs / Support" href="/app/docs" />
      </Box>
    </Box>
  );
}