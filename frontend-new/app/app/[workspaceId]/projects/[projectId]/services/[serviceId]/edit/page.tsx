'use client';

import { useParams, useRouter } from 'next/navigation';
import ServiceCreationPage from '@/components/services/ServiceCreationPage';

export default function EditServicePage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const projectId = params.projectId as string;
  const serviceId = params.serviceId as string;

  return (
    <ServiceCreationPage
      workspaceId={workspaceId}
      initialProjectId={projectId}
      serviceId={serviceId}
    />
  );
}
