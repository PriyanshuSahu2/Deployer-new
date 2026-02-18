// services/auth.ts
import { privateRequest } from "@/lib/requestMethod";

export function login(data: { identifier: string; password: string }) {
  return privateRequest.post("/auth/login", data);
}

export function logout() {
  return privateRequest.post("/auth/logout");
}

export const register = (body: {
  username: string;
  email: string;
  password: string;
}) =>
  privateRequest.post("/auth/register", body);

export const forgotPassword = (body: {
  email: string;
}) =>
  privateRequest.post("/auth/forgot-password", body);


export const resetPassword = (body: {
  otp: string;
  email: string;
  new_password: string;
}) =>
    privateRequest.post("/auth/reset-password", body);
