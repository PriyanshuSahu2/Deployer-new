import ServiceCreationPage from '@/components/services/ServiceCreationPage';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
  searchParams: Promise<{
    projectId?: string;
  }>;
}

export default async function CreateServerPage({
  params,
  searchParams,
}: PageProps) {
  const { workspaceId } = await params;
  const { projectId } = await searchParams;

  return (
    <ServiceCreationPage
      workspaceId={workspaceId}
      initialProjectId={projectId}
    />
  );
}
