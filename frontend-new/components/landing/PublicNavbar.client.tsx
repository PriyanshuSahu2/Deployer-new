'use client';

import Link from 'next/link';
import {
  Box,
  Burger,
  Button,
  Drawer,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useComputedColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { navLinks } from './data';

function DeployerLogo() {
  return (
    <Link
      href='/'
      style={{
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
      {/* SVG Mark */}
      <svg
        width='32'
        height='32'
        viewBox='0 0 32 32'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        aria-label='Deployer logo mark'>
        <defs>
          <linearGradient id='logo-grad' x1='0' y1='0' x2='1' y2='1'>
            <stop offset='0%' stopColor='#6366f1' />
            <stop offset='100%' stopColor='#2563eb' />
          </linearGradient>
        </defs>
        {/* Rounded square bg */}
        <rect width='32' height='32' rx='9' fill='url(#logo-grad)' />
        {/* Rocket body */}
        <path
          d='M16 6 C16 6 11 11 11 17.5 C11 19.5 11.8 21.2 13 22.5 L16 26 L19 22.5 C20.2 21.2 21 19.5 21 17.5 C21 11 16 6 16 6Z'
          fill='white'
          opacity='0.95'
        />
        {/* Exhaust */}
        <ellipse cx='16' cy='24' rx='2.5' ry='1.8' fill='white' opacity='0.5' />
        {/* Window */}
        <circle cx='16' cy='16' r='2.2' fill='url(#logo-grad)' />
        {/* Left fin */}
        <path d='M11 19.5 L8 23 L12 22 Z' fill='white' opacity='0.7' />
        {/* Right fin */}
        <path d='M21 19.5 L24 23 L20 22 Z' fill='white' opacity='0.7' />
      </svg>
      {/* Wordmark */}
      <Text
        fw={800}
        size='lg'
        style={{
          fontFamily: 'var(--font-sans)',
          letterSpacing: '-0.02em',
          background: 'linear-gradient(135deg, #6366f1 0%, #2563eb 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
        Deployer
      </Text>
    </Link>
  );
}

export default function PublicNavbar() {
  const [opened, { open, close }] = useDisclosure(false);
  const colorScheme = useComputedColorScheme('light');
  const isDark = colorScheme === 'dark';

  return (
    <>
      <Box
        h={68}
        px='lg'
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(15,23,42,0.07)'}`,
          backgroundColor: isDark
            ? 'rgba(10,10,18,0.92)'
            : 'rgba(255,255,255,0.92)',
          backdropFilter: 'blur(14px)',
          boxShadow: '0 1px 24px rgba(15,23,42,0.06)',
        }}>
        <DeployerLogo />

        <Group gap='xs' visibleFrom='sm'>
          {navLinks.map((link) => (
            <Button
              key={link.label}
              component='a'
              href={link.href}
              variant='subtle'
              color='gray'>
              {link.label}
            </Button>
          ))}
          <Link href='/auth/login'>
            <Button
              variant='gradient'
              gradient={{ from: 'indigo', to: 'blue', deg: 135 }}
              style={{ fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
              Get Started
            </Button>
          </Link>
        </Group>

        <Burger
          hiddenFrom='sm'
          opened={opened}
          onClick={opened ? close : open}
          aria-label='Toggle navigation'
          size='sm'
        />
      </Box>

      <Drawer
        opened={opened}
        onClose={close}
        title={<DeployerLogo />}
        hiddenFrom='sm'
        padding='lg'>
        <Stack gap='xs' mt='md'>
          {navLinks.map((link) => (
            <UnstyledButton
              key={link.label}
              component='a'
              href={link.href}
              onClick={close}
              style={(theme) => ({
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.radius.md,
              })}>
              <Text fw={500}>{link.label}</Text>
            </UnstyledButton>
          ))}
          <Link href='/auth/login' onClick={close}>
            <Button
              fullWidth
              variant='gradient'
              gradient={{ from: 'indigo', to: 'blue', deg: 135 }}>
              Get Started
            </Button>
          </Link>
        </Stack>
      </Drawer>
    </>
  );
}
