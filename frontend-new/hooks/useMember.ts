import { getWorkspaceMembers, inviteMember } from "@/service/member";
import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";

export const useInviteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: any) => inviteMember(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}


export const useGetWorkspaceMembers = (workspaceUUID:string,enabled: boolean) => {
    return useQuery({
        queryKey: ["workspace-members"],
        queryFn: () => getWorkspaceMembers(workspaceUUID),
        enabled: enabled,
        select: (res) => res.data,
    })

}


export const useGetWorkspaceInvites = (workspaceUUID:string,enabled: boolean) => {
    return useQuery({
        queryKey: ["workspace-invites"],
        queryFn: () => getWorkspaceMembers(workspaceUUID),
        enabled: enabled,
        select: (res) => res.data,
    })

}