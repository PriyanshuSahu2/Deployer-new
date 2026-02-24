'use client';

import { Box, Button, Center, Stack, Text, Title } from '@mantine/core';
import { IconRocket } from '@tabler/icons-react';
import CreateWorkspaceModal from '@/components/modals/CreateWorkspaceModal';
import { modals } from '@mantine/modals';

export default function OnboardingPage() {
  const openCreateWorkspaceModal = () => {
    modals.open({
      title: 'Create Workspace',
      children: <CreateWorkspaceModal />,
      size: 'md',
    });
  };

  return (
    <Center h='calc(100vh - 70px)'>
      <Box
        p='xl'
        style={{
          maxWidth: 400,
          width: '100%',
        }}>
        <Stack align='center' ta='center' gap='md'>
          <Box
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(99,102,241,0.4)',
            }}>
            <IconRocket size={28} color='white' stroke={1.5} />
          </Box>
          <Title order={2}>Welcome to Deployer</Title>
          <Text c='dimmed' size='sm' mt={-4}>
            It looks like you don&apos;t belong to any workspaces yet.
            Let&apos;s start by creating your first workspace.
          </Text>
          <Button
            fullWidth
            mt='md'
            onClick={openCreateWorkspaceModal}
            size='md'
            radius='md'>
            Create Workspace
          </Button>
        </Stack>
      </Box>
    </Center>
  );
}
