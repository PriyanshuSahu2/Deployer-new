// services/auth.ts
import { apiFetch } from "@/lib/api";

export function login(data: { identifier: string; password: string }) {
  return apiFetch("/api/auth/login", {
    method: "POST",
    body: data,
  });
}

export function logout() {
  return apiFetch("/api/auth/logout", {
    method: "POST",
  });
}

export const register = (body: {
  username: string;
  email: string;
  password: string;
}) =>
  apiFetch("/api/auth/login", {
    method: "POST",
    body: body,
  });

  export const forgotPassword = (body: {
  email: string;
}) =>
  apiFetch("/api/auth/forgot-password", {
    method: "POST",
    body: body,
  });


  export const resetPassword = (body: {
  otp: string;
  email: string;
  new_password: string;
}) =>
  apiFetch("/api/auth/reset-password", {
    method: "POST",
    body: body,
  });
