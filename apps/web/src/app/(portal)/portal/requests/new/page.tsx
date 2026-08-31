import type { Metadata } from "next";
import { CreateServiceRequestForm } from "@/features/service-requests/create-service-request-form";

export const metadata: Metadata = {
  title: "Yeni servis talebi",
};

export default function NewServiceRequestPage() {
  return <CreateServiceRequestForm />;
}
