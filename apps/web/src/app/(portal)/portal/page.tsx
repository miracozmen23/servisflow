import type { Metadata } from "next";
import { ServiceRequestList } from "@/features/service-requests/service-request-list";

export const metadata: Metadata = {
  title: "Servis taleplerim",
};

export default function PortalPage() {
  return <ServiceRequestList />;
}
