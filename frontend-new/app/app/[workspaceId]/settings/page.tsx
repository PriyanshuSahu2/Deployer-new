import WorkspaceSettingsClient from '@/components/workspace-settings/WorkspaceSettingsClient';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: 'Workspace Settings',
};

export default async function WorkspaceSettingsPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <WorkspaceSettingsClient workspaceId={workspaceId} />;
}
