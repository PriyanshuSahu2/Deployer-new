import RolesContainer from '@/components/roles/RolesContainer';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: 'Roles',
};

export default async function RolesPage({ params }: PageProps) {
  const { workspaceId } = await params;
  return <RolesContainer workspaceId={workspaceId} />;
}
