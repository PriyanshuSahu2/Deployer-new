'use client';

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
  Skeleton,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import {
  IconBell,
  IconChevronDown,
  IconLogout,
  IconMail,
  IconMoon,
  IconSettings,
  IconSun,
  IconUser,
  IconRocket,
} from '@tabler/icons-react';

import InvitesModal from '@/components/modals/InvitesModal';
import { useGetMe, useLogout } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { toggleColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const { data: me, isLoading: meLoading } = useGetMe();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        router.push('/auth/login');
      },
    });
  };

  const displayName = me?.username ?? 'Unknown User';
  const displayEmail = me?.email ?? 'No email';
  const openInviteModal = () => {
    modals.open({
      title: 'Invitations',
      children: <InvitesModal />,
      size: 'lg',
      styles: {
        header: {
          borderBottom: '1px solid var(--mantine-color-gray-3)',
        },
      },
    });
  };

  return (
    <Box
      h={70}
      px='lg'
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: '0 8px 30px rgba(0,0,0,0.05)',

        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}>
      {/* Brand */}
      <Group gap={8} align='center'>
        <Box
          style={{
            width: 30,
            height: 30,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(99,102,241,0.35)',
          }}>
          <IconRocket size={16} color='white' stroke={2} />
        </Box>
        <Text
          fw={700}
          size='sm'
          style={{
            letterSpacing: '-0.02em',

            fontFamily: 'inherit',
          }}>
          Deployer
        </Text>
        <Badge
          size='xs'
          variant='light'
          color='blue'
          radius='sm'
          style={{ fontWeight: 600, letterSpacing: '0.03em' }}>
          Pro
        </Badge>
      </Group>

      {/* Right side actions */}
      <Group gap={4}>
        {/* Theme toggle */}
        <ActionIcon
          variant='subtle'
          size='lg'
          radius='md'
          color='gray'
          onClick={toggleColorScheme}
          style={{ color: isDark ? '#fbbf24' : '#555' }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {isDark ? (
            <IconSun size={18} stroke={1.75} />
          ) : (
            <IconMoon size={18} stroke={1.75} />
          )}
        </ActionIcon>

        {/* Mail */}
        <Indicator
          label={3}
          size={16}
          offset={5}
          color='blue'
          styles={{ indicator: { fontSize: 9, fontWeight: 700 } }}>
          <ActionIcon
            variant='subtle'
            size='lg'
            radius='md'
            color='gray'
            style={{ color: '#555' }}
            onClick={openInviteModal}>
            <IconMail size={18} stroke={1.75} />
          </ActionIcon>
        </Indicator>

        {/* Bell */}
        <Indicator inline color='red' size={7} offset={5}>
          <ActionIcon
            variant='subtle'
            size='lg'
            radius='md'
            color='gray'
            style={{ color: '#555' }}>
            <IconBell size={18} stroke={1.75} />
          </ActionIcon>
        </Indicator>

        <Divider
          orientation='vertical'
          mx={6}
          style={{ height: 20, alignSelf: 'center' }}
        />

        {/* User menu */}
        <Menu
          shadow='lg'
          width={210}
          radius='md'
          offset={8}
          transitionProps={{ transition: 'pop-top-right', duration: 150 }}>
          <Menu.Target>
            <UnstyledButton
              style={{
                borderRadius: 10,
                padding: '5px 10px 5px 6px',
                transition: 'background 0.15s ease',
                display: 'flex',
                alignItems: 'center',
              }}
              styles={{
                root: {
                  '&:hover': { background: '#f4f4f5' },
                },
              }}>
              <Group gap={9}>
                {meLoading ? (
                  <>
                    <Skeleton circle height={40} />
                    <Box style={{ lineHeight: 1 }}>
                      <Skeleton height={10} width={90} mb={6} />
                      <Skeleton height={8} width={120} />
                    </Box>
                  </>
                ) : (
                  <>
                    <Avatar
                      src={me?.image}
                      name={me?.username}
                      size={40}
                      radius='xl'
                      color='indigo'
                    />

                    <Box style={{ lineHeight: 1, maxWidth: 140 }}>
                      <Text
                        size='sm'
                        fw={600}
                        truncate
                        style={{ letterSpacing: '-0.01em' }}>
                        {me?.username ?? 'Unknown User'}
                      </Text>

                      <Text size='xs' c='dimmed' mt={1} truncate>
                        {me?.email ?? 'No email'}
                      </Text>
                    </Box>
                  </>
                )}

                <IconChevronDown size={14} color='#aaa' stroke={2} />
              </Group>
            </UnstyledButton>
          </Menu.Target>

          <Menu.Dropdown
            style={{
              border: '1px solid rgba(0,0,0,0.08)',
              boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            }}>
            {/* User summary inside dropdown */}
            <Box px='sm' py='xs'>
              <Group gap={10}>
                <Box style={{ maxWidth: 160 }}>
                  <Text size='sm' fw={600} truncate>
                    {displayName}
                  </Text>
                  <Text size='xs' c='dimmed' truncate>
                    {displayEmail}
                  </Text>
                </Box>
              </Group>
            </Box>

            <Menu.Divider />

            <Menu.Item
              leftSection={<IconUser size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
              onClick={() => router.push('/app/profile')}>
              Profile
            </Menu.Item>
            <Menu.Item
              leftSection={<IconSettings size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
              onClick={() => router.push('/app/account-settings')}>
              Account Settings
            </Menu.Item>

            <Menu.Divider />

            <Menu.Item
              color='red'
              leftSection={<IconLogout size={15} stroke={1.75} />}
              style={{ fontSize: 13 }}
              onClick={handleLogout}>
              Logout
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
