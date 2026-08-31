import { apiFetch } from "@/lib/api/client";
import type { AuthUser, DataResponse } from "@/lib/api/types";
import type { LoginFormValues, RegisterFormValues } from "./auth-schemas";

export const authQueryKey = ["auth", "me"] as const;

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiFetch<DataResponse<AuthUser>>("/api/auth/me");
  return response.data;
}

export async function login(values: LoginFormValues): Promise<AuthUser> {
  const response = await apiFetch<DataResponse<AuthUser>>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(values),
  });
  return response.data;
}

export async function register(values: RegisterFormValues): Promise<AuthUser> {
  const response = await apiFetch<DataResponse<AuthUser>>(
    "/api/auth/register",
    {
      method: "POST",
      body: JSON.stringify(values),
    },
  );
  return response.data;
}

export async function logout(): Promise<void> {
  await apiFetch<DataResponse<{ success: true }>>("/api/auth/logout", {
    method: "POST",
  });
}
