import type { UserRole } from "@/lib/api/types";

export function getRoleHomePath(role: UserRole): "/portal" | "/technician" {
  return role === "CUSTOMER" ? "/portal" : "/technician";
}
