import ServiceCreationPage from '@/components/services/ServiceCreationPage';

interface PageProps {
  params: Promise<{
    workspaceId: string;
    projectId: string;
  }>;
  searchParams: Promise<{
    environmentId: string;
  }>;
}

export default async function CreateServerPage({
  params,
  searchParams,
}: PageProps) {
  const { workspaceId, projectId } = await params;
  const { environmentId } = await searchParams;

  return (
    <ServiceCreationPage
      workspaceId={workspaceId}
      initialProjectId={projectId}
      environmentId={environmentId}
    />
  );
}
