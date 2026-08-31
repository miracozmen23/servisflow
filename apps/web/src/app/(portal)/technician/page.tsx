import type { Metadata } from "next";
import { TechnicianRequestList } from "@/features/service-requests/technician-request-list";

export const metadata: Metadata = {
  title: "Teknik servis kuyruğu",
};

export default function TechnicianPage() {
  return <TechnicianRequestList />;
}
