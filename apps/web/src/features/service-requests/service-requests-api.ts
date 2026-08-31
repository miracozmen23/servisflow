import { apiFetch } from "@/lib/api/client";
import type { DataResponse } from "@/lib/api/types";
import type {
  CreateServiceNoteInput,
  CreateServiceRequestInput,
  CustomerServiceRequestDetail,
  ServiceNote,
  ServiceRequestListParams,
  ServiceRequestListResponse,
  ServiceRequestListItem,
  TechnicianServiceRequestDetail,
  TechnicianServiceRequestListItem,
  UpdateServiceRequestStatusInput,
} from "./service-request-types";

export const serviceRequestKeys = {
  all: ["service-requests"] as const,
  list: (params: ServiceRequestListParams) =>
    [...serviceRequestKeys.all, "customer-list", params] as const,
  technicianList: (params: ServiceRequestListParams) =>
    [...serviceRequestKeys.all, "technician-list", params] as const,
  detail: (requestId: string) =>
    [...serviceRequestKeys.all, "customer-detail", requestId] as const,
  technicianDetail: (requestId: string) =>
    [...serviceRequestKeys.all, "technician-detail", requestId] as const,
};

export async function listServiceRequests(
  params: ServiceRequestListParams,
): Promise<ServiceRequestListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 8),
  });

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params.search !== undefined && params.search.length > 0) {
    searchParams.set("search", params.search);
  }

  return apiFetch<ServiceRequestListResponse>(
    `/api/service-requests?${searchParams.toString()}`,
  );
}

export async function createServiceRequest(
  input: CreateServiceRequestInput,
): Promise<ServiceRequestListItem> {
  const response = await apiFetch<DataResponse<ServiceRequestListItem>>(
    "/api/service-requests",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function getServiceRequestDetail(
  requestId: string,
): Promise<CustomerServiceRequestDetail> {
  const response = await apiFetch<DataResponse<CustomerServiceRequestDetail>>(
    `/api/service-requests/${requestId}`,
  );

  return response.data;
}

export async function listTechnicianServiceRequests(
  params: ServiceRequestListParams,
): Promise<ServiceRequestListResponse<TechnicianServiceRequestListItem>> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit ?? 10),
  });

  if (params.status !== undefined) {
    searchParams.set("status", params.status);
  }

  if (params.search !== undefined && params.search.length > 0) {
    searchParams.set("search", params.search);
  }

  return apiFetch<
    ServiceRequestListResponse<TechnicianServiceRequestListItem>
  >(`/api/service-requests?${searchParams.toString()}`);
}

export async function getTechnicianServiceRequestDetail(
  requestId: string,
): Promise<TechnicianServiceRequestDetail> {
  const response = await apiFetch<DataResponse<TechnicianServiceRequestDetail>>(
    `/api/service-requests/${requestId}`,
  );

  return response.data;
}

export async function updateServiceRequestStatus({
  requestId,
  input,
}: {
  requestId: string;
  input: UpdateServiceRequestStatusInput;
}): Promise<ServiceRequestListItem> {
  const response = await apiFetch<DataResponse<ServiceRequestListItem>>(
    `/api/service-requests/${requestId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}

export async function addServiceRequestNote({
  requestId,
  input,
}: {
  requestId: string;
  input: CreateServiceNoteInput;
}): Promise<ServiceNote> {
  const response = await apiFetch<DataResponse<ServiceNote>>(
    `/api/service-requests/${requestId}/notes`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );

  return response.data;
}
