import { apiFetch } from "@/lib/api";

export const getUserWorkspace = () =>
    apiFetch("/api/workspace/get-user-workspace", {
        method: "GET",
    });