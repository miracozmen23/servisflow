import { apiFetch } from "@/lib/api/client";
import type { DataResponse } from "@/lib/api/types";
import type {
  CreateServiceRequestInput,
  CustomerServiceRequestDetail,
  ServiceRequestListParams,
  ServiceRequestListResponse,
  ServiceRequestListItem,
} from "./service-request-types";

export const serviceRequestKeys = {
  all: ["service-requests"] as const,
  list: (params: ServiceRequestListParams) =>
    [...serviceRequestKeys.all, "list", params] as const,
  detail: (requestId: string) =>
    [...serviceRequestKeys.all, "detail", requestId] as const,
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
