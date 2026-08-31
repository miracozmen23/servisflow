import { z } from "zod";
import type { ServiceRequestStatus } from "./service-request-types";

const statusSchema = z.enum([
  "WARRANTY_APPROVED",
  "WARRANTY_REJECTED",
  "DEVICE_RECEIVED",
  "DIAGNOSIS",
  "REPAIR",
  "QUALITY_CONTROL",
  "NOT_REPAIRABLE",
  "CLOSED",
]);

const resolutionStatuses = new Set<ServiceRequestStatus>([
  "NOT_REPAIRABLE",
  "CLOSED",
]);

export const createServiceNoteSchema = z.object({
  content: z
    .string()
    .trim()
    .min(2, "Teknik not en az 2 karakter olmalıdır.")
    .max(2000, "Teknik not en fazla 2000 karakter olabilir."),
});

export const updateServiceRequestStatusSchema = z
  .object({
    status: statusSchema,
    customerMessage: z
      .string()
      .trim()
      .max(500, "Müşteri mesajı en fazla 500 karakter olabilir."),
    resolutionSummary: z
      .string()
      .trim()
      .max(500, "Çözüm özeti en fazla 500 karakter olabilir."),
  })
  .superRefine((values, context) => {
    const needsResolution = resolutionStatuses.has(values.status);

    if (needsResolution && values.resolutionSummary.length < 10) {
      context.addIssue({
        code: "custom",
        message: "Bu durum için en az 10 karakterlik çözüm özeti zorunludur.",
        path: ["resolutionSummary"],
      });
    }
  });

export type CreateServiceNoteFormValues = z.infer<
  typeof createServiceNoteSchema
>;

export type UpdateServiceRequestStatusFormValues = z.infer<
  typeof updateServiceRequestStatusSchema
>;
