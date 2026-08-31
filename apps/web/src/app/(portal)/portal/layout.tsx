import type { ReactNode } from "react";
import { PortalShell } from "@/features/auth/portal-shell";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return <PortalShell requiredRole="CUSTOMER">{children}</PortalShell>;
}
