import { privateRequest } from "@/lib/requestMethod";

export const getUserWorkspace = () =>
  privateRequest.get("/workspaces");

export const createWorkspace = (name: string) =>
  privateRequest.post("/workspaces", { name });