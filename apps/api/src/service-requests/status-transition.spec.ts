import { ServiceRequestStatus } from '../generated/prisma/client';
import {
  canTransitionStatus,
  getAllowedNextStatuses,
  isTerminalStatus,
  requiresResolutionSummary,
} from './status-transition';

describe('service request status transitions', () => {
  it.each([
    [
      ServiceRequestStatus.WARRANTY_APPROVED,
      ServiceRequestStatus.DEVICE_RECEIVED,
    ],
    [ServiceRequestStatus.DEVICE_RECEIVED, ServiceRequestStatus.DIAGNOSIS],
    [ServiceRequestStatus.DIAGNOSIS, ServiceRequestStatus.REPAIR],
    [ServiceRequestStatus.DIAGNOSIS, ServiceRequestStatus.NOT_REPAIRABLE],
    [ServiceRequestStatus.REPAIR, ServiceRequestStatus.QUALITY_CONTROL],
    [ServiceRequestStatus.QUALITY_CONTROL, ServiceRequestStatus.CLOSED],
  ])('allows %s → %s', (currentStatus, nextStatus) => {
    expect(canTransitionStatus(currentStatus, nextStatus)).toBe(true);
  });

  it('rejects skipped and same-status transitions', () => {
    expect(
      canTransitionStatus(
        ServiceRequestStatus.WARRANTY_APPROVED,
        ServiceRequestStatus.DIAGNOSIS,
      ),
    ).toBe(false);
    expect(
      canTransitionStatus(
        ServiceRequestStatus.DIAGNOSIS,
        ServiceRequestStatus.DIAGNOSIS,
      ),
    ).toBe(false);
  });

  it.each([
    ServiceRequestStatus.WARRANTY_REJECTED,
    ServiceRequestStatus.NOT_REPAIRABLE,
    ServiceRequestStatus.CLOSED,
  ])('keeps %s terminal', (status) => {
    expect(isTerminalStatus(status)).toBe(true);
    expect(getAllowedNextStatuses(status)).toHaveLength(0);
  });

  it('requires a resolution only for technician terminal outcomes', () => {
    expect(requiresResolutionSummary(ServiceRequestStatus.NOT_REPAIRABLE)).toBe(
      true,
    );
    expect(requiresResolutionSummary(ServiceRequestStatus.CLOSED)).toBe(true);
    expect(
      requiresResolutionSummary(ServiceRequestStatus.WARRANTY_REJECTED),
    ).toBe(false);
    expect(requiresResolutionSummary(ServiceRequestStatus.REPAIR)).toBe(false);
  });
});
