import ProjectList from "@/components/projects/ProjectList";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: "Projects",
};

export default async function ProjectListPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <ProjectList workspaceId={workspaceId} />;
}
