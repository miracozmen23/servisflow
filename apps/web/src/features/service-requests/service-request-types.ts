export type WarrantyStatus = "APPROVED" | "REJECTED";

export type ServiceRequestStatus =
  | "WARRANTY_APPROVED"
  | "WARRANTY_REJECTED"
  | "DEVICE_RECEIVED"
  | "DIAGNOSIS"
  | "REPAIR"
  | "QUALITY_CONTROL"
  | "NOT_REPAIRABLE"
  | "CLOSED";

export type ServiceEventType =
  | "REQUEST_CREATED"
  | "STATUS_CHANGED"
  | "NOTE_ADDED";

export interface Person {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "TECHNICIAN";
}

export interface ServiceRequestListItem {
  id: string;
  rmaNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  warrantyStatus: WarrantyStatus;
  status: ServiceRequestStatus;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerTimelineEvent {
  id: string;
  type: ServiceEventType;
  oldStatus: ServiceRequestStatus | null;
  newStatus: ServiceRequestStatus | null;
  customerMessage: string | null;
  createdAt: string;
}

export interface TechnicianTimelineEvent extends CustomerTimelineEvent {
  actor: Person;
}

export interface ServiceNote {
  id: string;
  requestId: string;
  content: string;
  createdAt: string;
  author: Person;
}

export interface CustomerServiceRequestDetail
  extends ServiceRequestListItem {
  customerId: string;
  invoiceNumber: string;
  purchaseDate: string;
  warrantyExpiresAt: string;
  problemDescription: string;
  resolutionSummary: string | null;
  timeline: CustomerTimelineEvent[];
}

export interface TechnicianServiceRequestListItem
  extends ServiceRequestListItem {
  customer: Person;
}

export interface TechnicianServiceRequestDetail
  extends Omit<CustomerServiceRequestDetail, "timeline"> {
  customer: Person;
  notes: ServiceNote[];
  timeline: TechnicianTimelineEvent[];
}

export interface CreateServiceRequestInput {
  brand: string;
  model: string;
  serialNumber: string;
  invoiceNumber: string;
  purchaseDate: string;
  problemDescription: string;
}

export interface UpdateServiceRequestStatusInput {
  status: ServiceRequestStatus;
  resolutionSummary?: string;
  customerMessage?: string;
}

export interface CreateServiceNoteInput {
  content: string;
}

export interface ServiceRequestListParams {
  page: number;
  limit?: number;
  status?: ServiceRequestStatus;
  search?: string;
}

export interface ServiceRequestListResponse<
  TItem extends ServiceRequestListItem = ServiceRequestListItem,
> {
  data: TItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
