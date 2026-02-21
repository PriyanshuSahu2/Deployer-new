import MembersContainer from "@/components/members/MembersContainer";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function MembersPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <MembersContainer workspaceId={workspaceId} />;
}