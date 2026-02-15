import { getUserWorkspace } from "@/service/workspace"
import { useQuery } from "@tanstack/react-query"

export const useGetUserWorkspace = (enabled = false) =>{
    return useQuery({
        queryKey: ["user-workspace"],
        queryFn: () => getUserWorkspace(),
        enabled: enabled,
        select: (data) => data,
    })
}