import { redirect } from 'next/navigation';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function CreateServerPage({ params }: PageProps) {
  const { workspaceId } = await params;
  redirect(`/app/${workspaceId}/servers`);
}
