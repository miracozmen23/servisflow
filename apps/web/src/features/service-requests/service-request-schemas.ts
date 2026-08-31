import { z } from "zod";
import { getIstanbulToday } from "./service-request-metadata";

const trimmedText = (label: string, minimum: number, maximum: number) =>
  z
    .string()
    .trim()
    .min(minimum, `${label} en az ${minimum} karakter olmalıdır.`)
    .max(maximum, `${label} en fazla ${maximum} karakter olabilir.`);

function isCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (match === null) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export const createServiceRequestSchema = z.object({
  brand: trimmedText("Marka", 2, 100),
  model: trimmedText("Model", 2, 100),
  serialNumber: trimmedText("Seri numarası", 1, 100),
  invoiceNumber: trimmedText("Fatura numarası", 1, 100),
  purchaseDate: z
    .string()
    .min(1, "Satın alma tarihi zorunludur.")
    .refine(isCalendarDate, "Geçerli bir satın alma tarihi girin.")
    .refine(
      (value) => !isCalendarDate(value) || value <= getIstanbulToday(),
      "Satın alma tarihi gelecekte olamaz.",
    ),
  problemDescription: trimmedText("Problem açıklaması", 10, 2000),
});

export type CreateServiceRequestFormValues = z.infer<
  typeof createServiceRequestSchema
>;
