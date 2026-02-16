import { apiFetch } from "@/lib/api";

export const getUserWorkspace = () =>
    apiFetch("/api/workspace/get-user-workspace", {
        method: "GET",
    });

export const createWorkspace = (name: string) =>
    apiFetch("/api/workspace", {
        method: "POST",
        body: { name },
    });

