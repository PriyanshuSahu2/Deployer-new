import { apiFetch } from "@/lib/api";

export const inviteMember = (email: string, role: string) =>
    apiFetch("/api/workspace/invite-member", {
        method: "POST",
        body: { email, role },
    });
