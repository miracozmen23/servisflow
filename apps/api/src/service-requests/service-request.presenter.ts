import {
  ServiceEventType,
  ServiceRequestStatus,
  UserRole,
  WarrantyStatus,
} from '../generated/prisma/client';

export interface PersonView {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

export interface ServiceRequestView {
  id: string;
  rmaNumber: string;
  customerId: string;
  brand: string;
  model: string;
  serialNumber: string;
  invoiceNumber: string;
  purchaseDate: Date;
  warrantyExpiresAt: Date;
  warrantyStatus: WarrantyStatus;
  status: ServiceRequestStatus;
  problemDescription: string;
  resolutionSummary: string | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceRequestListBase {
  id: string;
  rmaNumber: string;
  brand: string;
  model: string;
  serialNumber: string;
  warrantyStatus: WarrantyStatus;
  status: ServiceRequestStatus;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TechnicianServiceRequestListItem extends ServiceRequestListBase {
  customer: PersonView;
}

export type ServiceRequestListItem =
  ServiceRequestListBase | TechnicianServiceRequestListItem;

export interface PublicTimelineEvent {
  id: string;
  type: ServiceEventType;
  oldStatus: ServiceRequestStatus | null;
  newStatus: ServiceRequestStatus | null;
  customerMessage: string | null;
  createdAt: Date;
}

export interface TechnicianTimelineEvent extends PublicTimelineEvent {
  actor: PersonView;
}

export interface ServiceNoteView {
  id: string;
  requestId: string;
  content: string;
  createdAt: Date;
  author: PersonView;
}

export interface CustomerServiceRequestDetail extends ServiceRequestView {
  timeline: PublicTimelineEvent[];
}

export interface TechnicianServiceRequestDetail extends ServiceRequestView {
  customer: PersonView;
  notes: ServiceNoteView[];
  timeline: TechnicianTimelineEvent[];
}

export type ServiceRequestDetail =
  CustomerServiceRequestDetail | TechnicianServiceRequestDetail;

export function presentCustomerDetail(
  record: ServiceRequestView & { events: PublicTimelineEvent[] },
): CustomerServiceRequestDetail {
  const { events, ...serviceRequest } = record;

  return {
    ...serviceRequest,
    timeline: events,
  };
}

export function presentTechnicianDetail(
  record: ServiceRequestView & {
    customer: PersonView;
    events: TechnicianTimelineEvent[];
    notes: ServiceNoteView[];
  },
): TechnicianServiceRequestDetail {
  const { customer, events, notes, ...serviceRequest } = record;

  return {
    ...serviceRequest,
    customer,
    notes,
    timeline: events,
  };
}

export function isTechnician(role: UserRole): boolean {
  return role === UserRole.TECHNICIAN;
}
