import { privateRequest } from "@/lib/requestMethod";

export const getUserWorkspace = () =>
  privateRequest.get("/workspace/get-user-workspaces");

export const createWorkspace = (name: string) =>
  privateRequest.post("/workspace", { name });
