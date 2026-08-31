import type { Metadata } from "next";
import { ServiceRequestDetail } from "@/features/service-requests/service-request-detail";

export const metadata: Metadata = {
  title: "Servis talebi detayı",
};

export default async function ServiceRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ServiceRequestDetail requestId={id} />;
}
