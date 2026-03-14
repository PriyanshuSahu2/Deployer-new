import IntegrationsList from "@/components/integrations/IntegrationsList";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: "Integrations",
};

export default async function IntegrationsPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <IntegrationsList workspaceId={workspaceId} />;
}