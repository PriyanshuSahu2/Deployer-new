'use client';

import {
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconLock,
  IconMail,
  IconShield,
} from '@tabler/icons-react';
import { useGetMe } from '@/hooks/useAuth';

function SectionIntro({
  icon,
  title,
  description,
  tone = 'default',
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  tone?: 'default' | 'danger';
}) {
  const isDanger = tone === 'danger';

  return (
    <div className='space-y-2'>
      <Group gap='sm'>
        <ThemeIcon
          size='lg'
          radius='md'
          variant={isDanger ? 'light' : 'subtle'}
          color={isDanger ? 'red' : 'blue'}>
          {icon}
        </ThemeIcon>
        <Title
          order={4}
          c={isDanger ? 'red' : 'var(--mantine-color-text)'}>
          {title}
        </Title>
      </Group>
      <Text size='sm' c='dimmed' className='max-w-2xl leading-6'>
        {description}
      </Text>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text fw={500} size='sm' mb={6} className='text-slate-900 dark:text-gray-100'>
      {children}
    </Text>
  );
}

const inputClassNames = {
  input:
    'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-400 focus:border-blue-500 transition-colors duration-200',
};

export default function AccountSettingsPage() {
  const { data: me } = useGetMe();

  return (
    <div className='mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8'>
      <Stack gap='lg'>
        <div className='space-y-1 border-b border-gray-200 pb-4 dark:border-white/10'>
        <Title order={2} c='var(--mantine-color-text)'>
          Account Settings
        </Title>
          <Text size='sm' c='dimmed'>
            Update your account email, password, and recovery settings.
          </Text>
        </div>

        <Paper
          withBorder
          radius='md'
          p='lg'
          className='border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-dark-700'>
          <Stack gap='md'>
            <SectionIntro
              icon={<IconMail size={18} />}
              title='Email'
              description='Keep your primary email up to date so login alerts, verification links, and account recovery continue to work.'
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <TextInput
                label={<FieldLabel>Current Email</FieldLabel>}
                value={me?.email || ''}
                disabled
                variant='filled'
                radius='md'
                size='md'
                classNames={inputClassNames}
              />
              <TextInput
                label={<FieldLabel>New Email</FieldLabel>}
                placeholder='new@example.com'
                variant='filled'
                radius='md'
                size='md'
                classNames={inputClassNames}
              />
            </div>

            <Group justify='flex-end'>
              <Button color='blue' radius='md' className='cursor-pointer'>
                Update Email
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper
          withBorder
          radius='md'
          p='lg'
          className='border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-dark-700'>
          <Stack gap='md'>
            <SectionIntro
              icon={<IconLock size={18} />}
              title='Password'
              description='Use a strong password that you do not reuse anywhere else. If you signed up with OAuth, you can set a password here later.'
            />

            <PasswordInput
              label={<FieldLabel>Current Password</FieldLabel>}
              placeholder='Enter current password'
              variant='filled'
              radius='md'
              size='md'
              classNames={inputClassNames}
            />

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <PasswordInput
                label={<FieldLabel>New Password</FieldLabel>}
                placeholder='Enter new password'
                variant='filled'
                radius='md'
                size='md'
                classNames={inputClassNames}
              />
              <PasswordInput
                label={<FieldLabel>Confirm Password</FieldLabel>}
                placeholder='Confirm new password'
                variant='filled'
                radius='md'
                size='md'
                classNames={inputClassNames}
              />
            </div>

            <Group justify='space-between' className='rounded-md bg-slate-50 px-4 py-3 dark:bg-dark-800'>
              <div>
                <Text fw={600} size='sm' c='var(--mantine-color-text)'>
                  Password guidance
                </Text>
                <Text size='sm' c='dimmed'>
                  Use at least 8 characters with a mix of letters and numbers.
                </Text>
              </div>
              <ThemeIcon size='lg' radius='xl' variant='light' color='blue'>
                <IconShield size={18} />
              </ThemeIcon>
            </Group>

            <Group justify='flex-end'>
              <Button color='blue' radius='md' className='cursor-pointer'>
                Change Password
              </Button>
            </Group>
          </Stack>
        </Paper>

        <Paper
          withBorder
          radius='md'
          p='lg'
          className='border-red-200 bg-red-50/70 shadow-sm dark:border-red-900/50 dark:bg-red-950/20'>
          <Stack gap='md'>
            <SectionIntro
              icon={<IconAlertTriangle size={18} />}
              title='Danger Zone'
              description='Deleting your account removes personal access and permanently deletes isolated data that belongs only to you.'
              tone='danger'
            />

            <Group justify='space-between' align='flex-start' className='gap-4'>
              <div className='space-y-1'>
                <Text fw={600} c='var(--mantine-color-text)'>
                  Delete Account
                </Text>
                <Text size='sm' c='dimmed'>
                  This action is permanent and cannot be undone.
                </Text>
              </div>
              <Button color='red' radius='md' className='cursor-pointer'>
                Delete my account
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </div>
  );
}
