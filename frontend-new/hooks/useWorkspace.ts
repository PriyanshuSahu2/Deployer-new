import { createWorkspace, getUserWorkspace } from "@/service/workspace"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetUserWorkspace = (enabled = false) => {
    return useQuery({
        queryKey: ["user-workspace"],
        queryFn: () => getUserWorkspace(),
        enabled: enabled,
        select: (data) => data,
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