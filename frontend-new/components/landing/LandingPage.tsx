import Link from 'next/link';
import { Box, Button, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconApi,
  IconArrowRight,
  IconCheck,
  IconCode,
  IconGitBranch,
  IconKey,
  IconLock,
  IconPlugConnected,
  IconRocket,
  IconServer,
  IconShield,
  IconTerminal,
  IconUserCog,
  IconUsers,
} from '@tabler/icons-react';
import DashboardPreview from './DashboardPreview';
import FeatureCard from './FeatureCard';
import PublicNavbar from './PublicNavbar.client';
import SectionHeader from './SectionHeader';
import SectionWrapper from './SectionWrapper';
import {
  features,
  personas,
  problemPoints,
  securityPoints,
  steps,
  useCases,
} from './data';

/* ─── icon maps ─────────────────────────────────────────── */
const useCaseIcons = [IconRocket, IconServer, IconGitBranch, IconUsers];
const useCaseColors = ['violet', 'teal', 'orange', 'pink'] as const;

const securityIcons = [IconShield, IconLock, IconKey];
const securityGradients = [
  { from: '#1e3a5f', to: '#1a2e50' },
  { from: '#1a3040', to: '#0f2030' },
  { from: '#1f2d4a', to: '#15233c' },
];

const problemColors = ['#ef4444', '#f59e0b', '#8b5cf6'] as const;
const problemBorders = ['#fca5a5', '#fcd34d', '#c4b5fd'] as const;

/* ─── component ─────────────────────────────────────────── */
export default function LandingPage() {
  const featureItems = [
    { ...features[0], icon: <IconGitBranch size={20} /> },
    { ...features[1], icon: <IconKey size={20} /> },
    { ...features[2], icon: <IconServer size={20} /> },
    { ...features[3], icon: <IconUsers size={20} /> },
    { ...features[4], icon: <IconApi size={20} /> },
  ];

  const stepItems = [
    { ...steps[0], icon: <IconGitBranch size={22} /> },
    { ...steps[1], icon: <IconPlugConnected size={22} /> },
    { ...steps[2], icon: <IconUserCog size={22} /> },
  ];

  return (
    <Box
      mih='100vh'
      style={{ fontFamily: 'var(--font-sans)', background: '#f8fafc' }}>
      <PublicNavbar />

      {/* ══ HERO — What is Deployer? ════════════════════════ */}
      <Box
        style={{
          backgroundImage:
            'linear-gradient(rgba(0,0,0,0.58), rgba(0,0,0,0.70)), url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: 'white',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}>
        <SectionWrapper>
          <div className='flex flex-col items-center justify-center text-center'>
            <Stack gap={28} align='center' maw={860} mx='auto'>
              {/* Eyebrow */}
              <Box
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'rgba(99,102,241,0.2)',
                  border: '1px solid rgba(99,102,241,0.4)',
                  borderRadius: 999,
                  padding: '6px 16px',
                }}>
                <IconRocket size={14} color='#a5b4fc' />
                <Text
                  size='xs'
                  fw={600}
                  style={{
                    color: '#a5b4fc',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}>
                  Deployment platform
                </Text>
              </Box>

              {/* Headline */}
              <Text
                fw={800}
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  lineHeight: 1.1,
                  letterSpacing: '-0.03em',
                  color: 'white',
                }}>
                Deploy to your own infrastructure.{' '}
                <span style={{ color: '#818cf8' }}>Without the chaos.</span>
              </Text>

              {/* Sub */}
              <Text
                size='xl'
                style={{ color: '#cbd5e1', lineHeight: 1.7, maxWidth: 660 }}>
                Deployer is a self-hosted platform that brings Git deployments,
                server management, environment configuration, team access
                control, and runtime logs into a single focused dashboard.
              </Text>

              {/* CTAs */}
              <Group gap='md' mt='sm'>
                <Link href='/auth/login'>
                  <Button
                    size='lg'
                    variant='gradient'
                    gradient={{ from: 'indigo', to: 'blue', deg: 135 }}
                    rightSection={<IconArrowRight size={16} />}
                    style={{ fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                    Get Started Free
                  </Button>
                </Link>
                <Button
                  component='a'
                  href='#how-it-works'
                  variant='outline'
                  color='gray'
                  size='lg'
                  style={{
                    borderColor: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    fontFamily: 'var(--font-sans)',
                  }}>
                  See How It Works
                </Button>
              </Group>
            </Stack>
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ PROBLEM — Why does it exist? ═══════════════════ */}
      <Box style={{ background: '#fff', borderBottom: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <Stack align='center' gap={4} mb={8}>
            <Text className='section-tag'>The Problem</Text>
            <Text
              fw={800}
              ta='center'
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}>
              Managing deployments shouldn't require 5 tools.
            </Text>
            <Text size='lg' c='dimmed' ta='center' maw={560} mt={8}>
              Most teams stitch together CI/CD pipelines, environment managers,
              access control systems, and logging tools — and still end up with
              gaps.
            </Text>
          </Stack>

          <div className='grid gap-6 md:grid-cols-3'>
            {problemPoints.map((point, i) => (
              <Box
                key={point.title}
                p='xl'
                style={{
                  borderRadius: 14,
                  background: '#fff',
                  border: '1px solid #f1f5f9',
                  borderLeft: `4px solid ${problemBorders[i]}`,
                  boxShadow: '0 2px 16px rgba(15,23,42,0.05)',
                }}>
                <Stack gap='sm'>
                  <Box
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: problemColors[i],
                    }}
                  />
                  <Text
                    fw={700}
                    style={{
                      color: '#0f172a',
                      fontSize: '1rem',
                      lineHeight: 1.4,
                    }}>
                    {point.title}
                  </Text>
                  <Text size='sm' c='dimmed' style={{ lineHeight: 1.7 }}>
                    {point.description}
                  </Text>
                </Stack>
              </Box>
            ))}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ WHO — Who uses it? ══════════════════════════════ */}
      <Box style={{ background: '#f8fafc' }}>
        <SectionWrapper>
          <Stack align='center' gap={4} mb={8}>
            <Text className='section-tag'>Who It's For</Text>
            <Text
              fw={800}
              ta='center'
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}>
              Built for the people who own production.
            </Text>
          </Stack>

          <div className='grid gap-8 lg:grid-cols-2'>
            {personas.map((persona, i) => (
              <Box
                key={persona.role}
                p='xl'
                style={{
                  borderRadius: 16,
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                }}>
                <Stack gap='lg'>
                  <Box>
                    <Box
                      mb='xs'
                      style={{
                        display: 'inline-block',
                        background:
                          i === 0
                            ? 'rgba(99,102,241,0.1)'
                            : 'rgba(16,185,129,0.1)',
                        color: i === 0 ? '#6366f1' : '#10b981',
                        padding: '4px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 700,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                      }}>
                      {persona.role}
                    </Box>
                    <Text
                      fw={800}
                      size='xl'
                      style={{ color: '#0f172a', letterSpacing: '-0.01em' }}>
                      {persona.headline}
                    </Text>
                    <Text c='dimmed' mt={6} style={{ lineHeight: 1.7 }}>
                      {persona.description}
                    </Text>
                  </Box>
                  <Stack gap='sm'>
                    {persona.points.map((point) => (
                      <Group key={point} gap='sm' align='flex-start'>
                        <Box
                          mt={2}
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background:
                              i === 0
                                ? 'rgba(99,102,241,0.12)'
                                : 'rgba(16,185,129,0.12)',
                            color: i === 0 ? '#6366f1' : '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                          <IconCheck size={11} />
                        </Box>
                        <Text
                          size='sm'
                          fw={500}
                          style={{ color: '#1e293b', lineHeight: 1.6 }}>
                          {point}
                        </Text>
                      </Group>
                    ))}
                  </Stack>
                </Stack>
              </Box>
            ))}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ HOW IT WORKS ════════════════════════════════════ */}
      <Box
        id='how-it-works'
        style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <Stack align='center' gap={4} mb={8}>
            <Text className='section-tag'>How It Works</Text>
            <Text
              fw={800}
              ta='center'
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}>
              From repo to running service in three steps.
            </Text>
          </Stack>

          <div className='grid gap-6 md:grid-cols-3'>
            {stepItems.map((step, index) => (
              <Box
                key={step.title}
                p='xl'
                style={{
                  borderRadius: 14,
                  background: '#fff',
                  borderLeft: '4px solid #6366f1',
                  boxShadow: '0 2px 16px rgba(99,102,241,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                {/* Watermark number */}
                <Text
                  style={{
                    position: 'absolute',
                    top: -12,
                    right: 14,
                    fontSize: 88,
                    fontWeight: 900,
                    color: '#eef2ff',
                    lineHeight: 1,
                    userSelect: 'none',
                    pointerEvents: 'none',
                    fontFamily: 'var(--font-sans)',
                  }}>
                  {String(index + 1).padStart(2, '0')}
                </Text>
                <Stack gap='md'>
                  <ThemeIcon
                    size={48}
                    radius='md'
                    variant='gradient'
                    gradient={{ from: 'indigo', to: 'violet', deg: 135 }}>
                    {step.icon}
                  </ThemeIcon>
                  <div>
                    <Text fw={700} size='lg' style={{ color: '#0f172a' }}>
                      {step.title}
                    </Text>
                    <Text
                      size='sm'
                      c='dimmed'
                      mt={6}
                      style={{ lineHeight: 1.7 }}>
                      {step.description}
                    </Text>
                  </div>
                </Stack>
              </Box>
            ))}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ CORE FEATURES ═══════════════════════════════════ */}
      <Box
        id='features'
        style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <Stack align='center' gap={4} mb={8}>
            <Text className='section-tag'>Core Features</Text>
            <Text
              fw={800}
              ta='center'
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                color: '#0f172a',
              }}>
              Everything the deployment lifecycle needs.
            </Text>
            <Text size='lg' c='dimmed' ta='center' maw={560} mt={8}>
              Organized around how work actually flows — from code to
              infrastructure to team access.
            </Text>
          </Stack>
          <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
            {featureItems.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ DEVELOPER EXPERIENCE ════════════════════════════ */}
      <Box style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <div className='grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center'>
            <Stack gap='lg'>
              <Stack gap={4}>
                <Text className='section-tag'>Developer Experience</Text>
                <Text
                  fw={800}
                  style={{
                    fontSize: 'clamp(1.6rem, 3vw, 2rem)',
                    letterSpacing: '-0.02em',
                    color: '#0f172a',
                  }}>
                  A clean API for everything you need.
                </Text>
              </Stack>
              <Text c='dimmed' style={{ lineHeight: 1.75 }}>
                Deployer exposes a REST API for every core operation — auth,
                workspaces, services, environments, servers, and roles. Build
                automation, integrate with CI, or extend the platform.
              </Text>
              <Stack gap='sm'>
                {[
                  'Project and service configuration in one flow',
                  'REST APIs for auth, workspaces, services, and roles',
                  'A UI that mirrors the actual deployment lifecycle',
                ].map((item) => (
                  <Group key={item} gap='sm'>
                    <Box
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'rgba(99,102,241,0.12)',
                        color: '#6366f1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <IconCheck size={11} />
                    </Box>
                    <Text size='sm' fw={500} style={{ color: '#1e293b' }}>
                      {item}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Stack>

            <Box
              p='lg'
              style={{
                border: '1px solid #e2e8f0',
                borderRadius: 16,
                background: '#fff',
                boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
              }}>
              <Stack gap='md'>
                <Group gap='sm'>
                  <ThemeIcon
                    size={36}
                    radius='md'
                    color='indigo'
                    variant='light'>
                    <IconTerminal size={16} />
                  </ThemeIcon>
                  <Text fw={700} style={{ color: '#0f172a' }}>
                    Example API Flow
                  </Text>
                </Group>
                <Box
                  component='pre'
                  p='md'
                  style={{
                    margin: 0,
                    borderRadius: 10,
                    background: '#0f172a',
                    color: '#94a3b8',
                    overflowX: 'auto',
                    fontSize: 13,
                    lineHeight: 1.8,
                    fontFamily: '"Fira Code", "Cascadia Code", monospace',
                  }}>
                  <span style={{ color: '#6366f1' }}>POST</span>{' '}
                  <span style={{ color: '#e2e8f0' }}>
                    /api/auth/login{'\n'}
                  </span>
                  <span style={{ color: '#6366f1' }}>GET</span>{' '}
                  <span style={{ color: '#e2e8f0' }}>/api/workspace{'\n'}</span>
                  <span style={{ color: '#6366f1' }}>POST</span>{' '}
                  <span style={{ color: '#e2e8f0' }}>
                    /api/workspace/invite-member{'\n'}
                  </span>
                  <span style={{ color: '#6366f1' }}>PATCH</span>{' '}
                  <span style={{ color: '#e2e8f0' }}>/api/roles{'\n\n'}</span>
                  <span style={{ color: '#475569' }}>{'{\n'}</span>
                  <span style={{ color: '#475569' }}>{'  '}</span>
                  <span style={{ color: '#818cf8' }}>"workspaceId"</span>
                  <span style={{ color: '#475569' }}>: </span>
                  <span style={{ color: '#34d399' }}>"ws_prod"</span>
                  <span style={{ color: '#475569' }}>{',\n  '}</span>
                  <span style={{ color: '#818cf8' }}>"service"</span>
                  <span style={{ color: '#475569' }}>: </span>
                  <span style={{ color: '#34d399' }}>"web-app"</span>
                  <span style={{ color: '#475569' }}>{',\n  '}</span>
                  <span style={{ color: '#818cf8' }}>"server"</span>
                  <span style={{ color: '#475569' }}>: </span>
                  <span style={{ color: '#34d399' }}>"fra-01"</span>
                  <span style={{ color: '#475569' }}>{'\n}'}</span>
                </Box>
              </Stack>
            </Box>
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ SECURITY ════════════════════════════════════════ */}
      <Box style={{ background: '#0f172a', borderTop: '1px solid #1e293b' }}>
        <SectionWrapper>
          <Stack align='center' gap={4} mb={8}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#818cf8',
              }}>
              Security
            </Text>
            <Text
              fw={800}
              ta='center'
              style={{
                fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                letterSpacing: '-0.02em',
                color: '#f1f5f9',
              }}>
              Built with security in mind.
            </Text>
            <Text
              ta='center'
              maw={520}
              mt={8}
              style={{ color: '#94a3b8', lineHeight: 1.7 }}>
              Access control is part of platform operations, not an afterthought
              layered on top.
            </Text>
          </Stack>

          <div className='grid gap-6 md:grid-cols-3'>
            {securityPoints.map((point, i) => {
              const Icon = securityIcons[i % securityIcons.length];
              const grad = securityGradients[i % securityGradients.length];
              return (
                <Box
                  key={point.title}
                  p='xl'
                  style={{
                    borderRadius: 14,
                    background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`,
                    border: '1px solid rgba(99,102,241,0.25)',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  <Box
                    style={{
                      position: 'absolute',
                      top: -30,
                      right: -30,
                      width: 100,
                      height: 100,
                      borderRadius: '50%',
                      background: 'rgba(99,102,241,0.15)',
                      filter: 'blur(20px)',
                    }}
                  />
                  <Stack gap='md'>
                    <ThemeIcon
                      size={48}
                      radius='md'
                      variant='gradient'
                      gradient={{ from: 'indigo', to: 'cyan', deg: 135 }}>
                      <Icon size={22} />
                    </ThemeIcon>
                    <div>
                      <Text fw={700} style={{ color: '#e2e8f0' }}>
                        {point.title}
                      </Text>
                      <Text
                        size='sm'
                        mt={6}
                        style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                        {point.description}
                      </Text>
                    </div>
                  </Stack>
                </Box>
              );
            })}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ USE CASES ═══════════════════════════════════════ */}
      <Box style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <SectionHeader
            title='Use Cases'
            description='Built for teams running more than a single app and needing a clearer operational surface.'
          />
          <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-4'>
            {useCases.map((item, i) => {
              const Icon = useCaseIcons[i % useCaseIcons.length];
              const color = useCaseColors[i % useCaseColors.length];
              return (
                <Box
                  key={item}
                  p='lg'
                  className='use-case-card'
                  style={{
                    borderRadius: 14,
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 10px rgba(15,23,42,0.02)',
                    cursor: 'default',
                  }}>
                  <Group gap='md' align='center'>
                    <ThemeIcon
                      size={40}
                      radius='md'
                      variant='light'
                      color='indigo'>
                      <Icon size={20} />
                    </ThemeIcon>
                    <Text
                      fw={600}
                      size='sm'
                      style={{ color: '#1e293b', flex: 1, lineHeight: 1.4 }}>
                      {item}
                    </Text>
                  </Group>
                </Box>
              );
            })}
          </div>
        </SectionWrapper>
      </Box>

      {/* ══ DASHBOARD PREVIEW ═══════════════════════════════ */}
      <Box style={{ background: '#fff', borderTop: '1px solid #e2e8f0' }}>
        <SectionWrapper>
          <SectionHeader
            title='Dashboard Preview'
            description='A single operational surface for services, servers, members, and deployment visibility.'
          />
          <DashboardPreview />
        </SectionWrapper>
      </Box>

      {/* ══ CTA BANNER ══════════════════════════════════════ */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #1e3a8a 100%)',
          borderTop: '1px solid rgba(99,102,241,0.2)',
        }}>
        <SectionWrapper>
          <Stack align='center' gap='lg' py={16}>
            <Stack align='center' gap='sm'>
              <Text
                fw={800}
                ta='center'
                style={{
                  fontSize: 'clamp(1.6rem, 3vw, 2.2rem)',
                  letterSpacing: '-0.02em',
                  color: '#f1f5f9',
                }}>
                Ready to own your deployment pipeline?
              </Text>
              <Text
                ta='center'
                maw={480}
                style={{ color: '#94a3b8', lineHeight: 1.7 }}>
                Self-hosted and built for teams that need real infrastructure
                control.
              </Text>
            </Stack>
            <Group gap='md'>
              <Link href='/auth/login'>
                <Button
                  size='lg'
                  variant='gradient'
                  gradient={{ from: 'indigo', to: 'blue', deg: 135 }}
                  rightSection={<IconArrowRight size={16} />}
                  style={{ fontWeight: 700, fontFamily: 'var(--font-sans)' }}>
                  Get Started Free
                </Button>
              </Link>
            </Group>
          </Stack>
        </SectionWrapper>
      </Box>

      {/* ══ FOOTER ══════════════════════════════════════════ */}
      <Box
        px='lg'
        py='md'
        style={{
          background: '#0f172a',
          borderTop: '1px solid #1e293b',
        }}>
        <div className='mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Group gap='sm'>
            <Text
              fw={700}
              style={{ color: '#e2e8f0', fontFamily: 'var(--font-sans)' }}>
              Deployer
            </Text>
            <Text size='xs' style={{ color: '#475569' }}>
              © 2026 — Self-hosted deployment platform.
            </Text>
          </Group>
          <Group gap='lg'>
            {[
              { label: 'Features', href: '#features' },
              { label: 'Docs', href: '#how-it-works' },
              { label: 'Contact', href: 'mailto:contact@deployer.dev' },
            ].map((l) => (
              <Text
                key={l.label}
                component='a'
                href={l.href}
                size='sm'
                className='footer-link'>
                {l.label}
              </Text>
            ))}
          </Group>
        </div>
      </Box>
    </Box>
  );
}
