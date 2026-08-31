import type { ReactNode } from "react";
import { PortalShell } from "@/features/auth/portal-shell";

export default function TechnicianLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <PortalShell requiredRole="TECHNICIAN">{children}</PortalShell>;
}
