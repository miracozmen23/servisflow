import { ServiceRequestStatus } from '../generated/prisma/client';

const STATUS_TRANSITIONS: Readonly<
  Record<ServiceRequestStatus, readonly ServiceRequestStatus[]>
> = {
  [ServiceRequestStatus.WARRANTY_APPROVED]: [
    ServiceRequestStatus.DEVICE_RECEIVED,
  ],
  [ServiceRequestStatus.WARRANTY_REJECTED]: [],
  [ServiceRequestStatus.DEVICE_RECEIVED]: [ServiceRequestStatus.DIAGNOSIS],
  [ServiceRequestStatus.DIAGNOSIS]: [
    ServiceRequestStatus.REPAIR,
    ServiceRequestStatus.NOT_REPAIRABLE,
  ],
  [ServiceRequestStatus.REPAIR]: [ServiceRequestStatus.QUALITY_CONTROL],
  [ServiceRequestStatus.QUALITY_CONTROL]: [ServiceRequestStatus.CLOSED],
  [ServiceRequestStatus.NOT_REPAIRABLE]: [],
  [ServiceRequestStatus.CLOSED]: [],
};

const TERMINAL_STATUSES = new Set<ServiceRequestStatus>([
  ServiceRequestStatus.WARRANTY_REJECTED,
  ServiceRequestStatus.NOT_REPAIRABLE,
  ServiceRequestStatus.CLOSED,
]);

const RESOLUTION_REQUIRED_STATUSES = new Set<ServiceRequestStatus>([
  ServiceRequestStatus.NOT_REPAIRABLE,
  ServiceRequestStatus.CLOSED,
]);

export function canTransitionStatus(
  currentStatus: ServiceRequestStatus,
  nextStatus: ServiceRequestStatus,
): boolean {
  return STATUS_TRANSITIONS[currentStatus].includes(nextStatus);
}

export function isTerminalStatus(status: ServiceRequestStatus): boolean {
  return TERMINAL_STATUSES.has(status);
}

export function requiresResolutionSummary(
  status: ServiceRequestStatus,
): boolean {
  return RESOLUTION_REQUIRED_STATUSES.has(status);
}

export function getAllowedNextStatuses(
  status: ServiceRequestStatus,
): readonly ServiceRequestStatus[] {
  return STATUS_TRANSITIONS[status];
}
