import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function CreateProjectPage({ params }: PageProps) {
  const { workspaceId } = await params;

  redirect(`/app/${workspaceId}/projects`);
}
