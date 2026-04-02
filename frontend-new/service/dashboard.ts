import { privateRequest } from "@/lib/requestMethod";

export const getDeploymentStats = async (workspaceUUID: string) => {
    const response = await privateRequest.get(`/workspaces/${workspaceUUID}/dashboard/stats`);
    return response.data;
};

export const getWorkspaceDeployments = async (workspaceUUID: string) => {
    const response = await privateRequest.get(`/workspaces/${workspaceUUID}/dashboard/deployments`);
    return response.data;
};

export const getDeploymentLogs = async (workspaceUUID: string, deploymentUUID: string) => {
    const response = await privateRequest.get(`/workspaces/${workspaceUUID}/dashboard/deployments/${deploymentUUID}/logs`);
    return response.data;
};
