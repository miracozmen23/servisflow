import type { ReactNode } from "react";
import { AuthPageGuard } from "@/features/auth/auth-page-guard";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <AuthPageGuard>{children}</AuthPageGuard>;
}
