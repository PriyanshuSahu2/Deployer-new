import ServicePage from "@/components/services/ServiceList";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function ServersRoutePage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <ServicePage workspaceId={workspaceId} />;
}
