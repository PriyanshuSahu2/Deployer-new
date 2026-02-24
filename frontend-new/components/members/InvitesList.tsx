import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Group,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { IconMail, IconTrash } from '@tabler/icons-react';
import { useGetWorkspaceInvites, useInviteMember } from '@/hooks/useMember';
import { useParams } from 'next/navigation';
import { notifications } from '@mantine/notifications';

interface WorkspaceInvite {
  email: string;
  role: string;
  role_uuid: string;
  status: string;
  workspace_name?: string;
  invited_by?: string;
}

function InviteRow({
  invite,
  workspaceId,
}: {
  invite: WorkspaceInvite;
  workspaceId: string;
}) {
  const { mutateAsync: resendInvite, isPending } = useInviteMember();

  const handleResend = async () => {
    try {
      await resendInvite({
        user_email: invite.email,
        role_uuid: invite.role_uuid,
        workspace_uuid: workspaceId,
      });
      notifications.show({
        title: 'Success',
        message: 'Invite resent successfully',
        color: 'green',
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Failed to resend invite';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  return (
    <Paper withBorder p='md' radius='sm'>
      <Group justify='space-between'>
        <Group gap='sm'>
          <Avatar radius='sm' size='md' color='gray' variant='light'>
            <IconMail size={16} />
          </Avatar>
          <div>
            <Text size='sm' fw={500}>
              {invite.email}
            </Text>
            <Text size='xs' c='dimmed'>
              Status:{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {invite.status}
              </span>
            </Text>
          </div>
        </Group>
        <Group gap='sm'>
          <Badge color={''} variant='light' size='sm' radius='sm'>
            {invite.role}
          </Badge>
          <Button
            variant='default'
            size='xs'
            radius='sm'
            onClick={handleResend}
            loading={isPending}
            disabled={invite.status === 'accepted'}>
            Resend
          </Button>
          <ActionIcon variant='subtle' color='red'>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>
      </Group>
    </Paper>
  );
}

export default function InvitesList() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: invites = [] } = useGetWorkspaceInvites(workspaceId, true);

  if (invites.length === 0) {
    return (
      <Text c='dimmed' size='sm' ta='center' mt='md'>
        No pending invites found.
      </Text>
    );
  }

  return (
    <Stack gap='xs'>
      {invites.map((i: WorkspaceInvite) => (
        <InviteRow key={i.email} invite={i} workspaceId={workspaceId} />
      ))}
    </Stack>
  );
}
