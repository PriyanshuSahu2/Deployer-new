import { getRoles } from "@/service/role"
import { createWorkspace, getUserWorkspace } from "@/service/workspace"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetRoles = (workspaceUuid: string, enabled = false) => {
    return useQuery({
        queryKey: ["roles", workspaceUuid],
        queryFn: () => getRoles(workspaceUuid),
        enabled: enabled,
        select: (res) => res.data,
    })
}
