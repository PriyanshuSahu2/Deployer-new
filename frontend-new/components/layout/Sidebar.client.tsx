"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Group,
  Popover,
  Stack,
  Text,
  UnstyledButton,
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
      { icon: IconLayoutDashboard, label: "Overview", href: "/app" },
      { icon: IconFolders, label: "Projects", href: "/app/projects" },
      { icon: IconRocket, label: "Deployments", href: "/app/deployments" },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { icon: IconVariable, label: "Environments", href: "/app/environments" },
      { icon: IconServer, label: "Servers / Infra", href: "/app/servers" },
      { icon: IconWorld, label: "Domains", href: "/app/domains" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { icon: IconFileText, label: "Logs", href: "/app/logs" },
      { icon: IconHistory, label: "Activity / Audit", href: "/app/activity" },
    ],
  },
  {
    label: "Automation",
    items: [
      { icon: IconGitBranch, label: "CI / CD", href: "/app/cicd" },
      {
        icon: IconPlugConnected,
        label: "Integrations",
        href: "/app/integrations",
      },
    ],
  },
  {
    label: "Management",
    items: [
      { icon: IconUsers, label: "Members", href: "/app/members" },
      {
        icon: IconSettings,
        label: "Workspace Settings",
        href: "/app/settings",
      },
      { icon: IconCreditCard, label: "Billing & Usage", href: "/app/billing" },
    ],
  },
];

function NavButton({ icon: Icon, label, href }: NavItem) {
  const pathname = usePathname();
  const theme = useMantineTheme();

  const active = pathname === href;

  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][0];

  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200"
      style={{
        backgroundColor: active ? primary : undefined,
      }}
    >
      <Icon
        size={18}
        stroke={1.5}
        style={{
          color: active ? "white" : theme.colors.gray[6],
        }}
      />
      <span
        className="text-sm font-medium truncate"
        style={{
          color: active ? "white" : theme.colors.gray[8],
        }}
      >
        {label}
      </span>
    </Link>
  );
}

function NavGroup({ label, items }: NavGroupType) {
  const [opened, setOpened] = useState(true);
  const theme = useMantineTheme();

  const primary = theme.colors[theme.primaryColor][6];
  const { data: workspaces } = useGetUserWorkspace(true);
  console.log("User workspaces:", workspaces);
  return (
    <div>
      <button
        onClick={() => setOpened((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-2 rounded-lg transition"
      >
        <span
          className="text-xs font-bold uppercase"
          style={{ color: primary }}
        >
          {label}
        </span>

        <IconChevronDown
          size={14}
          className={`transition-transform duration-300 ${
            opened ? "rotate-180" : ""
          }`}
          style={{ color: primary }}
        />
      </button>

      <Collapse in={opened}>
        <div className="mt-2 space-y-1">
          {items.map((item, index) => (
            <NavButton key={index} {...item} />
          ))}
        </div>
      </Collapse>
    </div>
  );
}

interface Workspace {
  name: string;
}

function WorkspaceSwitcher({
  onNewWorkspace,
}: {
  onNewWorkspace?: () => void;
}) {
  const theme = useMantineTheme();

  const [popoverOpened, setPopoverOpened] = useState(false);
  const [currentWorkspace, setCurrentWorkspace] = useState("Global");

  const workspaces: Workspace[] = [
    { name: "Global" },
    { name: "Production" },
    { name: "Staging" },
    { name: "Development" },
  ];

  const primary = theme.colors[theme.primaryColor][6];
  const primaryLight = theme.colors[theme.primaryColor][0];

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
          className="w-full p-4! !border-b transition-all duration-200"
          style={{
            borderColor: theme.colors.gray[3],
            backgroundColor: theme.white,
          }}
        >
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={700}>
                {currentWorkspace}
              </Text>
              <Text size="xs" c={theme.primaryColor}>
                Switch workspace
              </Text>
            </Box>

            <IconSelector size={18} stroke={1.5} />
          </Group>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown p="xs">
        <Stack gap="xs">
          <Text size="xs" fw={600} c="dimmed" px="xs" pt={4}>
            WORKSPACES
          </Text>

          {workspaces.map((workspace) => {
            const isActive = workspace.name === currentWorkspace;

            return (
              <UnstyledButton
                key={workspace.name}
                onClick={() => {
                  setCurrentWorkspace(workspace.name);
                  setPopoverOpened(false);
                }}
                className="w-full px-3! py-2! rounded-md transition-all flex items-center justify-between"
                style={{
                  backgroundColor: isActive ? primaryLight : undefined,
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
            leftSection={<IconUserPlus size={16} />}
            styles={{ root: { justifyContent: "flex-start" } }}
          >
            Invite Members
          </Button>

          <Button
            variant="subtle"
            color="gray"
            size="sm"
            fullWidth
            onClick={onNewWorkspace}
            leftSection={<IconPlus size={16} />}
            styles={{ root: { justifyContent: "flex-start" } }}
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

  return (
    <div
      className="w-64 h-screen border-r flex flex-col"
      style={{
        backgroundColor: theme.white,
        borderColor: theme.colors.gray[3],
      }}
    >
      {/* Workspace Switcher */}
      <WorkspaceSwitcher
        onNewWorkspace={() => console.log("New workspace clicked")}
      />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {navigationGroups.map((group, index) => (
          <NavGroup key={index} {...group} />
        ))}
      </div>

      {/* Docs */}
      <div
        className="border-t p-3"
        style={{ borderColor: theme.colors.gray[3] }}
      >
        <NavButton icon={IconBook} label="Docs / Support" href="/app/docs" />
      </div>
    </div>
  );
}
