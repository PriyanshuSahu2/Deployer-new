import {
  ActionIcon,
  Avatar,
  Badge,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
} from '@mantine/core';
import { useGetWorkspaceMembers } from '@/hooks/useMember';
import { useParams } from 'next/navigation';
import {
  IconCrown,
  IconDots,
  IconShieldCog,
  IconTrash,
} from '@tabler/icons-react';

interface Member {
  user_uuid: string;
  name: string;
  email: string;
  role: string;
  joined?: string;
}

function MemberRow({ member }: { member: Member }) {
  return (
    <Paper withBorder p='md' radius='sm'>
      <Group justify='space-between'>
        <Group gap='sm'>
          <Avatar name={member.name} color='initials' radius='sm' size='md' />
          <div>
            <Text size='sm' fw={500}>
              {member.name}
            </Text>
            <Text size='xs' c='dimmed'>
              {member.email}
            </Text>
          </div>
        </Group>
        <Group gap='sm'>
          <Text size='xs' c='dimmed'>
            Joined {member.joined}
          </Text>
          <Badge color={'blue'} variant='light' size='sm' radius='sm'>
            {member.role}
          </Badge>
          <Menu withinPortal position='bottom-end' shadow='sm'>
            <Menu.Target>
              <ActionIcon variant='subtle' color='gray' size='sm'>
                <IconDots size={14} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {member.role?.toUpperCase() === 'OWNER' ? (
                <Menu.Item leftSection={<IconCrown size={16} />}>
                  Transfer ownership
                </Menu.Item>
              ) : (
                <Menu.Item leftSection={<IconShieldCog size={16} />}>
                  Change role
                </Menu.Item>
              )}
              <Menu.Item color='red' leftSection={<IconTrash size={16} />}>
                Remove
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Group>
    </Paper>
  );
}

export default function MembersList() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { data: members = [] } = useGetWorkspaceMembers(workspaceId, true);
  return (
    <Stack gap='xs'>
      {members.map((m: Member) => (
        <MemberRow key={m.user_uuid} member={m} />
      ))}
    </Stack>
  );
}
