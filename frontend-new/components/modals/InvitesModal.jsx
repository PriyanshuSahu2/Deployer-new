import { useGetInvites } from "@/hooks/useInvites";
import {
  Modal,
  Box,
  Text,
  Group,
  Avatar,
  Badge,
  Button,
  ThemeIcon,
  ScrollArea,
  Stack,
} from "@mantine/core";
import { useDisclosure, useListState } from "@mantine/hooks";
import {
  IconBuilding,
  IconShieldCheck,
  IconMailForward,
  IconCheck,
  IconX,
  IconInbox,
} from "@tabler/icons-react";

const roleColors = {
  Admin: { color: "red", bg: "#fff1f1", border: "#ffd6d6", text: "#c92a2a" },
  Member: { color: "blue", bg: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
  Viewer: { color: "gray", bg: "#f9fafb", border: "#e5e7eb", text: "#4b5563" },
  Editor: {
    color: "violet",
    bg: "#f5f3ff",
    border: "#ddd6fe",
    text: "#6d28d9",
  },
};

const workspaceGradients = [
  "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
  "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
];

function InviteRow({ invite, index, onAccept, onDecline }) {
  const role = invite?.role ?? "Member";
  const roleStyle = roleColors[role] ?? roleColors.Member;
  const gradient = workspaceGradients[index % workspaceGradients.length];

  const isExpired = invite.status === "expired";
  return (
    <Box
      style={{
        borderRadius: 4,
        border: "1px solid #f0f0f0",
        background: isExpired ? "#fff0f0" : "#fff",
        padding: "14px 16px",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        "&:hover": {
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
          borderColor: "#e0e0e0",
        },
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="md">
        {/* Left: Workspace info */}
        <Group gap={12} wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
          <ThemeIcon
            size={40}
            radius="md"
            style={{
              background: gradient,
              boxShadow: "0 3px 10px rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}
          >
            <IconBuilding size={19} color="white" stroke={1.75} />
          </ThemeIcon>

          <Box style={{ minWidth: 0, flex: 1 }}>
            <Group gap={8} mb={3} wrap="nowrap">
              <Text
                fw={700}
                size="sm"
                style={{
                  color: "#111",
                  letterSpacing: "-0.02em",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {invite.workspace_name}
              </Text>
             
              <Badge color={roleStyle.color}>{invite.role}</Badge>
            </Group>

            <Group gap={6} wrap="nowrap">
              <Avatar
                name={invite.inviterName}
                size={16}
                radius="xl"
                color="indigo"
              />
              <Text
                size="xs"
                c="dimmed"
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                <Text component="span" size="xs" c="dimmed" fw={500}>
                  {invite.invited_by}
                </Text>{" "}
                · {invite.email}
              </Text>
            </Group>
          </Box>
        </Group>
        {invite.status === "pending" ? (
          <Group gap={8} wrap="nowrap" style={{ flexShrink: 0 }}>
            <Button
              variant="light"
              color="red"
              radius="md"
              size="xs"
              px="sm"
              leftSection={<IconX size={13} stroke={2.5} />}
              onClick={() => onDecline(invite.id)}
              styles={{ root: { fontWeight: 600 } }}
            >
              Decline
            </Button>
            <Button
              radius="md"
              size="xs"
              px="sm"
              leftSection={<IconCheck size={13} stroke={2.5} />}
              onClick={() => onAccept(invite.id)}
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)",
                boxShadow: "0 3px 10px rgba(99,102,241,0.3)",
                fontWeight: 600,
              }}
            >
              Accept
            </Button>
          </Group>
        ) : (
          <Text size="sm" fw={800} c="red">
            {invite.status.charAt(0).toUpperCase() + invite.status.slice(1)}
          </Text>
        )}
      </Group>
    </Box>
  );
}

function InvitesModal({ opened, onClose, initialInvites = [] }) {
  const [a, handlers] = useListState();
  const { data: invites = [], isLoading } = useGetInvites(opened);

  const handleAccept = (id) => {
    handlers.filter((inv) => inv.id !== id);
  };

  const handleDecline = (id) => {
    handlers.filter((inv) => inv.id !== id);
  };

  return (
    <>
      <Box>
        {!invites || invites?.length == 0 ? (
          <Box py={40} style={{ textAlign: "center" }}>
            <ThemeIcon
              size={48}
              radius="xl"
              variant="light"
              color="gray"
              mx="auto"
              mb="md"
            >
              <IconInbox size={24} />
            </ThemeIcon>
            <Text size="sm" fw={500} c="dimmed">
              No pending invitations
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              You&apos;re all caught up!
            </Text>
          </Box>
        ) : (
          <ScrollArea.Autosize mah={580} offsetScrollbars>
            <Stack gap={8} pr={4}>
              {invites?.map((invite, index) => (
                <InviteRow
                  key={invite.id}
                  invite={invite}
                  index={index}
                  onAccept={handleAccept}
                  onDecline={handleDecline}
                />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Box>
    </>
  );
}

export default InvitesModal;
