import { privateRequest, publicRequest } from "@/lib/requestMethod";

export const getUserWorkspace = () =>
  privateRequest.get("/workspace");

export const createWorkspace = (name: string) =>
  privateRequest.post("/workspace", { name });


