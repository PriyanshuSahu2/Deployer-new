import { useMemo, useState } from "react";
import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Text,
  Select,
  ActionIcon,
  Badge,
  Divider,
} from "@mantine/core";
import { IconPlus, IconX } from "@tabler/icons-react";
import { useInviteMember } from "@/hooks/useMember";
import { useGetRoles } from "@/hooks/useRoles";
import { useParams } from "next/navigation";

interface Invitee {
  email: string;
  role: string;
}

const roles = [
  { value: "admin", label: "Admin" },
  { value: "member", label: "Member" },
  { value: "viewer", label: "Viewer" },
];

export default function InviteMemberModal() {
  const [email, setEmail] = useState("");
  const [invitees, setInvitees] = useState<Invitee[]>([]);
  const [error, setError] = useState("");

  const { mutateAsync: inviteMemberAsync } = useInviteMember();
  const params = useParams();

  const workspaceId = params.workspaceId as string;
  const { data: rolesData } = useGetRoles(workspaceId, !!workspaceId);

  const roles = useMemo(() => {
    return (
      rolesData?.map((role) => ({
        value: role.uuid,
        label: role?.role_name || "",
      })) ?? []
    );
  }, []);
  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const addInvitee = () => {
    if (!email.trim()) return;

    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }

    if (invitees.some((i) => i.email === email)) {
      setError("Email already added");
      return;
    }

    setInvitees([...invitees, { email, role: "member" }]);
    setEmail("");
    setError("");
  };

  const removeInvitee = (emailToRemove: string) => {
    setInvitees(invitees.filter((i) => i.email !== emailToRemove));
  };

  const updateRole = (emailToUpdate: string, role: string | null) => {
    setInvitees((prev) =>
      prev.map((i) =>
        i.email === emailToUpdate ? { ...i, role: role || "member" } : i,
      ),
    );
  };

  const handleSubmit = async () => {
    try {
      await Promise.all(
        invitees.map((invitee) =>
          inviteMemberAsync({
            user_email: invitee.email,
            role_uuid: invitee.role,
            workspace_uuid: workspaceId,
          }),
        ),
      );
      setInvitees([]);
    } catch (error) {
      console.error("Failed to invite members:", error);
    }
  };

  return (
    <Stack gap="md">
      <Text size="sm" c="dimmed">
        Add teammates to collaborate on deployments and projects.
      </Text>

      <Group align="flex-end">
        <TextInput
          label="Email address"
          placeholder="john@company.com"
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
          error={error}
          style={{ flex: 1 }}
          onKeyDown={(e) => e.key === "Enter" && addInvitee()}
        />
        <Button leftSection={<IconPlus size={16} />} onClick={addInvitee}>
          Add
        </Button>
      </Group>

      {invitees.length > 0 && (
        <>
          <Divider label="Invited members" labelPosition="center" />

          <Stack gap="sm">
            {invitees.map((invitee) => (
              <Group key={invitee.email} justify="space-between">
                <Badge variant="light">{invitee.email}</Badge>

                <Group>
                  <Select
                    data={roles}
                    value={invitee.role}
                    onChange={(value) => updateRole(invitee.email, value)}
                    w={140}
                  />

                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => removeInvitee(invitee.email)}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                </Group>
              </Group>
            ))}
          </Stack>
        </>
      )}

      <Divider />

      {/* Footer */}
      <Group justify="flex-end">
        <Button variant="default">Cancel</Button>
        <Button disabled={invitees.length === 0} onClick={handleSubmit}>
          Send Invites
        </Button>
      </Group>
    </Stack>
  );
}
