import { acceptWorkspaceInvite, declineWorkspaceInvite, getInvites, getWorkspaceInviteByToken } from "@/service/invite"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetWorkspaceInviteByToken = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => getWorkspaceInviteByToken(token),
        onSuccess: () => {

        },
    });

}

export const useAcceptWorkspaceInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => acceptWorkspaceInvite(token),
        onSuccess: () => {

        },
    });

}

export const useDeclineWorkspaceInvite = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (token: string) => declineWorkspaceInvite(token),
        onSuccess: () => {

        },
    });

}



export const useGetInvites = (enabled: boolean) => {
    return useQuery({
        queryKey: ["invites"],
        queryFn: () => getInvites(),
        enabled: enabled,
        select: (res) => res.data,
    })

}