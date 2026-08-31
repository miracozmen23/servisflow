import type { Metadata } from "next";
import { TechnicianRequestDetail } from "@/features/service-requests/technician-request-detail";

export const metadata: Metadata = {
  title: "Teknik servis talep detayı",
};

export default async function TechnicianRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <TechnicianRequestDetail requestId={id} />;
}
