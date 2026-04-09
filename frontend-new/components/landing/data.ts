export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
];

export const features = [
  {
    title: 'Git-Based Deployments',
    description:
      'Connect repositories, track branches, and ship changes through a consistent deployment flow.',
  },
  {
    title: 'Services & Environments',
    description:
      'Manage services, build settings, runtime variables, and environment-specific configuration.',
  },
  {
    title: 'Servers & Infrastructure',
    description:
      'Register infrastructure targets and control where each workload is deployed.',
  },
  {
    title: 'Auth, Teams, and RBAC',
    description:
      'Handle login, workspace membership, and role-based access control from the same product surface.',
  },
  {
    title: 'Logs, Integrations, and APIs',
    description:
      'Monitor deployments, connect external tooling, and automate workflows through APIs.',
  },
];

export const steps = [
  {
    title: 'Connect your codebase',
    description:
      'Link a repository, choose a branch, and define how the project should build.',
  },
  {
    title: 'Configure infrastructure',
    description:
      'Attach servers, environment variables, and deployment settings for each service.',
  },
  {
    title: 'Deploy and operate',
    description:
      'Ship updates, inspect logs, and manage team access from one dashboard.',
  },
];

export const securityPoints = [
  {
    title: 'Token-Based Auth',
    description: 'Token-based authentication for user and workspace sessions.',
  },
  {
    title: 'Route Protection',
    description:
      'Middleware protection for workspace routes and sensitive actions.',
  },
  {
    title: 'Role-Based Access',
    description:
      'Fine-grained authorization for projects, services, members, and infrastructure.',
  },
];

export const useCases = [
  'Self-hosted SaaS deployment',
  'Internal platform engineering',
  'Multi-service staging and production flows',
  'Team-based infrastructure operations',
];

export const problemPoints = [
  {
    title: 'Too many disconnected tools',
    description:
      'CI/CD, environment configs, server registration, team access — all across different products with no single view.',
  },
  {
    title: 'Access control is an afterthought',
    description:
      'Most platforms bolt on permissions later. Deployer treats RBAC as a first-class part of every operation.',
  },
  {
    title: 'No visibility into what shipped',
    description:
      'Logs are fragmented, deployments go untracked, and teams debug blindly without a clear operational timeline.',
  },
];

export const personas = [
  {
    role: 'For Developers',
    headline: 'Ship without the overhead',
    description:
      'Connect your repo, define your build, and deploy to your own server in minutes. No vendor lock-in, no platform tax.',
    points: [
      'Git-driven deployment flow',
      'Per-service environment variables',
      'Build and runtime log access',
    ],
  },
  {
    role: 'For Platform & Ops Teams',
    headline: 'Own your infrastructure surface',
    description:
      'Register servers, manage workspaces, control who can deploy what — all from one focused dashboard designed for operators.',
    points: [
      'Multi-server registration and targeting',
      'Role-based access across all resources',
      'Workspace-level audit and member management',
    ],
  },
];

export const userRows = [
  {
    name: 'Alex Morgan',
    email: 'alex@deployer.dev',
    role: 'Owner',
    status: 'Active',
  },
  {
    name: 'Priya Shah',
    email: 'priya@deployer.dev',
    role: 'Deploy Admin',
    status: 'Active',
  },
  {
    name: 'Marcus Lee',
    email: 'marcus@deployer.dev',
    role: 'Reviewer',
    status: 'Pending',
  },
];

export const roleRows = [
  {
    name: 'Owner',
    description: 'Workspace, billing, members, and policy control',
  },
  {
    name: 'Deploy Admin',
    description: 'Projects, services, environments, and servers',
  },
  {
    name: 'Reviewer',
    description: 'Read logs, inspect builds, and approve access',
  },
];
