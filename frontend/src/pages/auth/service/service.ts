import { publicRequest } from "../../../config/requestMethod";

export const login = (params: { identifier: string; password: string }) =>
  publicRequest.post("/auth/login", params, { withCredentials: true });

export const register = (params: {
  username: string;
  email: string;
  password: string;
}) => publicRequest.post("/auth/register", params);
