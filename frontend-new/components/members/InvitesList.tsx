import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { IconMail, IconTrash } from "@tabler/icons-react";

const invited = [
  { id: 4, email: "chris@company.com", role: "Editor", sent: "2 days ago" },
  { id: 5, email: "dana@example.com", role: "Viewer", sent: "5 days ago" },
];
function InviteRow({ invite }: { invite: (typeof invited)[0] }) {
  return (
    <Paper withBorder p="md" radius="sm">
      <Group justify="space-between">
        <Group gap="sm">
          <Avatar radius="sm" size="md" color="gray" variant="light">
            <IconMail size={16} />
          </Avatar>
          <div>
            <Text size="sm" fw={500}>
              {invite.email}
            </Text>
            <Text size="xs" c="dimmed">
              Sent {invite.sent}
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <Badge color={""} variant="light" size="sm" radius="sm">
            {invite.role}
          </Badge>
          <Button variant="default" size="xs" radius="sm">
            Resend
          </Button>
          <ActionIcon variant="subtle" color="red">
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}
export default function InvitesList() {
  return (
    <Stack gap="xs">
      {invited.map((i) => (
        <InviteRow key={i.id} invite={i} />
      ))}
    </Stack>
  );
}
