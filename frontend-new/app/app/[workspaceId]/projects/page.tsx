import ProjectsContainer from '@/components/projects/ProjectsContainer';

interface PageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export const metadata = {
  title: 'Projects',
};

export default async function ProjectPage({ params }: PageProps) {
  const { workspaceId } = await params;

  return <ProjectsContainer workspaceId={workspaceId} />;
}
