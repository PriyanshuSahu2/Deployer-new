'use client';

import {
  Title,
  Text,
  Paper,
  TextInput,
  Button,
  Group,
  Avatar,
  Stack,
  Divider,
} from '@mantine/core';
import { useGetMe } from '@/hooks/useAuth';
import { IconDeviceFloppy } from '@tabler/icons-react';

export default function ProfilePage() {
  const { data: me, isLoading } = useGetMe();

  return (
    <div className='mx-auto w-full max-w-5xl p-4 sm:p-6 lg:p-8'>
      <div className='mb-8 pb-4 border-b border-gray-200 dark:border-white/10'>
        <Title
          order={2}
          className='font-semibold'
          c='var(--mantine-color-text)'>
          Profile
        </Title>
        <Text c='dimmed' size='sm' mt={4}>
          Manage your personal details across the Deployer ecosystem.
        </Text>
      </div>

      <Paper
        withBorder
        radius='md'
        p='lg'
        className='border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-dark-700'>
        <Stack gap='lg'>
          <Group
            align='center'
            gap='xl'
            className='border-b border-gray-200 pb-6 dark:border-white/10'>
            <Avatar
              src={me?.image}
              name={me?.username}
              color='indigo'
              size={120}
              radius='xl'
              className='shadow-md ring-4 ring-white dark:ring-dark-700 transition-all duration-300 hover:ring-indigo-500/20'
            />
            <div className='flex flex-col gap-3'>
              <Text
                fw={600}
                size='lg'
                c='var(--mantine-color-text)'>
                Profile Picture
              </Text>
              <Text size='sm' c='dimmed' className='max-w-md'>
                We support PNGs, JPEGs and GIFs under 5MB. We recommend a 1:1
                aspect ratio.
              </Text>
              <Group gap='sm' mt={4}>
                <Button
                  variant='filled'
                  color='indigo'
                  size='sm'
                  className='shadow-sm transition-colors duration-200 cursor-pointer'>
                  Upload Image
                </Button>
                <Button
                  variant='subtle'
                  color='red'
                  size='sm'
                  className='cursor-pointer'>
                  Remove
                </Button>
              </Group>
            </div>
          </Group>

          <div className='grid grid-cols-1 gap-4 py-2 md:grid-cols-2'>
            <TextInput
              label={
                <Text
                  fw={500}
                  size='sm'
                  mb={4}
                  className='text-slate-900 dark:text-gray-100'>
                  Username
                </Text>
              }
              value={me?.username || ''}
              disabled={isLoading}
              readOnly
              variant='filled'
              radius='md'
              size='md'
              classNames={{
                input:
                  'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-400 focus:border-indigo-500 transition-colors duration-200',
              }}
            />
            <TextInput
              label={
                <Text
                  fw={500}
                  size='sm'
                  mb={4}
                  className='text-slate-900 dark:text-gray-100'>
                  Email Address
                </Text>
              }
              value={me?.email || ''}
              disabled={isLoading}
              readOnly
              variant='filled'
              radius='md'
              size='md'
              classNames={{
                input:
                  'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-400 focus:border-indigo-500 transition-colors duration-200',
              }}
            />

            <TextInput
              label={
                <Text
                  fw={500}
                  size='sm'
                  mb={4}
                  className='text-slate-900 dark:text-gray-100'>
                  Full Name
                </Text>
              }
              placeholder='e.g. Jane Doe'
              value={me?.name || ''}
              disabled={isLoading}
              readOnly
              variant='filled'
              radius='md'
              size='md'
              classNames={{
                input:
                  'bg-gray-50 dark:bg-dark-800 border-gray-200 dark:border-dark-400 focus:border-indigo-500 transition-colors duration-200',
              }}
            />
          </div>

          <Divider my='sm' color='gray.2' className='dark:opacity-20' />

          <Group justify='flex-end'>
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              color='indigo'
              size='md'
              radius='md'
              className='shadow-sm hover:-translate-y-[1px] transition-all duration-200 cursor-pointer'>
              Save Changes
            </Button>
          </Group>
        </Stack>
      </Paper>
    </div>
  );
}
