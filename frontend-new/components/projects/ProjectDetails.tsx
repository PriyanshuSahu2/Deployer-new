"use client";

import { useGetProjectDetails } from "@/hooks/useProjects";
import { Select, Avatar, TextInput } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";

const ProjectDetails = ({ workspaceId, projectId }: { workspaceId: string, projectId: string }) => {

  const { data: project, isLoading } = useGetProjectDetails(workspaceId, projectId, true);
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{project?.name}</h1>
          <p className="text-gray-500">{project?.description}</p>
        </div>

        <div className="flex items-center gap-3">
          <Select
            data={["DEV", "STAGING", "PROD"]}
            defaultValue="PROD"
            className="w-28"
          />

        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
