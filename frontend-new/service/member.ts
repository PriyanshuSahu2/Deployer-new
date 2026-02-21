import { privateRequest } from "@/lib/requestMethod";

export const inviteMember = (params) =>
    privateRequest.post("/workspace/invite-member", params);




export const getWorkspaceMembers = (workspaceUUID: string) => privateRequest.get(`/members/${workspaceUUID}`)


