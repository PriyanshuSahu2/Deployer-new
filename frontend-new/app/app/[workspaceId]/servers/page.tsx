import ServersPage from '@/components/servers/ServerList';

export const metadata = {
  title: 'Servers',
};

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function ServersRoutePage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <ServersPage workspaceId={workspaceId} />;
}
