import {
    createWorkspace,
    createWorkspaceAPIKey,
    getUserWorkspace,
    getWorkspaceSettings,
    revokeWorkspaceAPIKey,
    transferWorkspaceOwnership,
    updateWorkspaceSettings,
} from "@/service/workspace"
import type { UpdateWorkspaceSettingsPayload } from "@/types/workspace-settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetUserWorkspace = (enabled = false) => {
    return useQuery({
        queryKey: ["user-workspace"],
        queryFn: () => getUserWorkspace(),
        enabled: enabled,
        select: (res) => res.data,
    })
}

export const useCreateWorkspace = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => createWorkspace(name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}

export const useWorkspaceSettings = (workspaceUUID: string) => {
    return useQuery({
        queryKey: ["workspace-settings", workspaceUUID],
        queryFn: () => getWorkspaceSettings(workspaceUUID).then((res) => res.data),
        enabled: !!workspaceUUID,
    });
}

export const useUpdateWorkspaceSettings = (workspaceUUID: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: UpdateWorkspaceSettingsPayload) =>
            updateWorkspaceSettings(workspaceUUID, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-settings", workspaceUUID] });
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}

export const useCreateWorkspaceAPIKey = (workspaceUUID: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (name: string) => createWorkspaceAPIKey(workspaceUUID, name),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-settings", workspaceUUID] });
        },
    });
}

export const useRevokeWorkspaceAPIKey = (workspaceUUID: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (keyUUID: string) => revokeWorkspaceAPIKey(workspaceUUID, keyUUID),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-settings", workspaceUUID] });
        },
    });
}

export const useTransferWorkspaceOwnership = (workspaceUUID: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newOwnerId: string) =>
            transferWorkspaceOwnership(workspaceUUID, newOwnerId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["workspace-settings", workspaceUUID] });
            queryClient.invalidateQueries({ queryKey: ["workspace-members", workspaceUUID] });
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}
