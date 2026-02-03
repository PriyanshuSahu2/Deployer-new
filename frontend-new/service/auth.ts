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
