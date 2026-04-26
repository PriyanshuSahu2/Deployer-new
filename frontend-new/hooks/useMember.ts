import { getWorkspaceMembers, inviteMember } from "@/service/member";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useInviteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ workspaceUUID, params }: { workspaceUUID: string; params: Record<string, unknown> }) =>
            inviteMember(workspaceUUID, params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}


export const useGetWorkspaceMembers = (workspaceUUID: string, enabled: boolean) => {
    return useQuery({
        queryKey: ["workspace-members", workspaceUUID],
        queryFn: () => getWorkspaceMembers(workspaceUUID),
        enabled: enabled && !!workspaceUUID,
        select: (res) => res.data,
    })

}


export const useGetWorkspaceInvites = (workspaceUUID: string, enabled: boolean) => {
    return useQuery({
        queryKey: ["workspace-invites", workspaceUUID],
        queryFn: () => getWorkspaceMembers(workspaceUUID),
        enabled: enabled && !!workspaceUUID,
        select: (res) => res.data,
    })

}
