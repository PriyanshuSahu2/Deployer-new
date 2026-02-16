import { inviteMember } from "@/service/member";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useInviteMember = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: any) => inviteMember(params.email, params.role),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user-workspace"] });
        },
    });
}