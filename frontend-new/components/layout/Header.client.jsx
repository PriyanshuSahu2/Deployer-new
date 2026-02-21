"use client";

import {
  Group,
  Avatar,
  Text,
  ActionIcon,
  Indicator,
  UnstyledButton,
  Menu,
  Box,
  Divider,
  Badge,
  useComputedColorScheme,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconMail,
  IconSettings,
  IconUser,
  IconRocket,
} from "@tabler/icons-react";

import InvitesModal from "@/components/modals/InvitesModal";

export default function Header() {
  const colorScheme = useComputedColorScheme("light");
  const isDark = colorScheme === "dark";

  console.log("Current color scheme:", colorScheme);
  const openInviteModal = () => {
    modals.open({
      title: "Invitations",
      children: <InvitesModal />,
      size: "lg",
      styles: {
        header: {
          borderBottom: "1px solid var(--mantine-color-gray-3)",
        },
      },
    });
  };

  return (
    <Box
      h={70}
      px="lg"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
        boxShadow: "0 8px 30px rgba(0,0,0,0.05)",

        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      {/* Brand */}
      <Group gap={8} align="center">
        <Box
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(99,102,241,0.35)",
          }}
        >
          <IconRocket size={16} color="white" stroke={2} />
        </Box>
        <Text
          fw={700}
          size="sm"
          style={{
            letterSpacing: "-0.02em",

            fontFamily: "inherit",
          }}
        >
          Deployer
        </Text>
        <Badge
          size="xs"
          variant="light"
          color="blue"
          radius="sm"
          style={{ fontWeight: 600, letterSpacing: "0.03em" }}
        >
          Pro
        </Badge>
      </Group>

      {/* Right side actions */}
      <Group gap={4}>
        {/* Mail */}
        <Indicator
          label={3}
          size={16}
          offset={5}
          color="blue"
          styles={{ indicator: { fontSize: 9, fontWeight: 700 } }}
        >
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="md"
            color="gray"
            style={{ color: "#555" }}
            onClick={openInviteModal}
          >
            <IconMail size={18} stroke={1.75} />
          </ActionIcon>
        </Indicator>

        {/* Bell */}
        <Indicator inline color="red" size={7} offset={5}>
          <ActionIcon
            variant="subtle"
            size="lg"
            radius="md"
            color="gray"
            style={{ color: "#555" }}
          >
            <IconBell size={18} stroke={1.75} />
          </ActionIcon>
        </Indicator>

        <Divider
          orientation="vertical"
          mx={6}
          style={{ height: 20, alignSelf: "center" }}
        />

        {/* User menu */}
        <Menu
          shadow="lg"
          width={210}
          radius="md"
          offset={8}
          transitionProps={{ transition: "pop-top-right", duration: 150 }}
        >
          <Menu.Target>
            <UnstyledButton
              style={{
                borderRadius: 10,
                padding: "5px 10px 5px 6px",
                transition: "background 0.15s ease",
                display: "flex",
                alignItems: "center",
              }}
              styles={{
                root: {
                  "&:hover": { background: "#f4f4f5" },
                },
              }}
            >
              <Group gap={9}>
                <Avatar name="Priyanshu" size={40} color="indigo" />
                <Box style={{ lineHeight: 1 }}>
                  <Text size="sm" fw={600} style={{ letterSpacing: "-0.01em" }}>
                    Priyanshu
                  </Text>
                  <Text size="xs" c="dimmed" mt={1}>
                    Admin
                  </Text>
                </Box>
                <IconChevronDown size={14} color="#aaa" stroke={2} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown
            style={{
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
            }}
          >
            {/* User summary inside dropdown */}
            <Box px="sm" py="xs">
              <Group gap={10}>
                <Avatar name="Priyanshu" size={36} radius="xl" color="indigo" />
                <Box>
                  <Text size="sm" fw={600} >
                    Priyanshu
                  </Text>
                  <Text size="xs" c="dimmed">
                    priyanshu@acme.com
                  </Text>
                </Box>
              </Group>
            </Box>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconUser size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
            >
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
            >
              Account Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color="red"
              leftSection={<IconLogout size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
            >
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
