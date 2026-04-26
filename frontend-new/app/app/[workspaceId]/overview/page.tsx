import OverviewPageClient from '@/components/overview/OverviewPageClient';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: 'Overview',
};

export default async function OverviewPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <OverviewPageClient workspaceId={workspaceId} />;
}
