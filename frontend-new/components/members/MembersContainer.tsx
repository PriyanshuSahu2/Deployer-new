'use client';

import { Stack, Group, Text, Title, Button, Tabs } from '@mantine/core';
import MembersList from './MembersList';
import InvitesList from './InvitesList';
import { modals } from '@mantine/modals';
import InviteMemberModal from '@/components/modals/InviteMemberModal';
import { usePermission } from '../context/permission-context';

interface Props {
  workspaceId: string;
}

export default function MembersContainer({ workspaceId }: Props) {

  const permission = usePermission()

  const openInviteModal = () => {
    modals.open({
      title: 'Invite members',
      size: 'lg',
      children: <InviteMemberModal />,
    });
  };

  return (
    <Stack gap='lg' p='md' mx='auto'>
      <Group justify='space-between' align='flex-end'>
        <div>
          <Text size='xs' c='dimmed' tt='uppercase' fw={500} mb={4}>
            Workspace
          </Text>
          <Title order={3} fw={600}>
            Members
          </Title>
        </div>
        <Button size='sm' radius='sm' onClick={openInviteModal}>
          + Invite
        </Button>
      </Group>

      <Tabs defaultValue='active'>
        <Tabs.List mb='md'>
          <Tabs.Tab value='active'>Active</Tabs.Tab>
          <Tabs.Tab value='invited'>Invited</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value='active'>
          <MembersList />
        </Tabs.Panel>

        <Tabs.Panel value='invited'>
          <InvitesList />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}
