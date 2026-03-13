import ProjectDetails from "@/components/projects/ProjectDetails";

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: 'Projects',
};

export default async function ProjectDetailsPage({ params }: PageProps) {
  const { workspaceId,projectId } = await params;

  return <ProjectDetails workspaceId={workspaceId} projectId={projectId} />;
}
