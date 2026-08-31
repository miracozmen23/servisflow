import type {
  ServiceEventType,
  ServiceRequestStatus,
  WarrantyStatus,
} from "./service-request-types";

interface StatusMetadata {
  label: string;
  description: string;
  badgeClassName: string;
}

export const serviceRequestStatuses: readonly ServiceRequestStatus[] = [
  "WARRANTY_APPROVED",
  "WARRANTY_REJECTED",
  "DEVICE_RECEIVED",
  "DIAGNOSIS",
  "REPAIR",
  "QUALITY_CONTROL",
  "NOT_REPAIRABLE",
  "CLOSED",
];

export const statusMetadata: Record<ServiceRequestStatus, StatusMetadata> = {
  WARRANTY_APPROVED: {
    label: "Garanti onaylandı",
    description: "Talep garanti kapsamında servise kabul edilmeyi bekliyor.",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  WARRANTY_REJECTED: {
    label: "Garanti kapsamı dışında",
    description: "Garanti süresi sona erdiği için talep kapatıldı.",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  },
  DEVICE_RECEIVED: {
    label: "Cihaz teslim alındı",
    description: "Cihaz teknik servis tarafından teslim alındı.",
    badgeClassName:
      "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-300",
  },
  DIAGNOSIS: {
    label: "Teşhis aşamasında",
    description: "Teknik ekip arızanın nedenini inceliyor.",
    badgeClassName:
      "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
  },
  REPAIR: {
    label: "Onarım sürüyor",
    description: "Cihaz üzerinde onarım işlemleri yürütülüyor.",
    badgeClassName:
      "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-300",
  },
  QUALITY_CONTROL: {
    label: "Kalite kontrol",
    description: "Onarım sonrası son kontroller yapılıyor.",
    badgeClassName:
      "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-300",
  },
  NOT_REPAIRABLE: {
    label: "Onarılamadı",
    description: "Teknik inceleme sonucunda cihaz onarılamaz olarak kapatıldı.",
    badgeClassName:
      "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300",
  },
  CLOSED: {
    label: "Tamamlandı",
    description: "Servis işlemleri tamamlandı ve talep kapatıldı.",
    badgeClassName:
      "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
};

export const warrantyMetadata: Record<
  WarrantyStatus,
  { label: string; badgeClassName: string }
> = {
  APPROVED: {
    label: "Garanti kapsamında",
    badgeClassName:
      "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300",
  },
  REJECTED: {
    label: "Garanti kapsamı dışında",
    badgeClassName:
      "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300",
  },
};

export const eventTypeLabels: Record<ServiceEventType, string> = {
  REQUEST_CREATED: "Servis talebi oluşturuldu",
  STATUS_CHANGED: "Talep durumu güncellendi",
  NOTE_ADDED: "Teknik not eklendi",
};

export function formatCalendarDate(value: string): string {
  const datePart = value.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);

  if (year === undefined || month === undefined || day === undefined) {
    return value;
  }

  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

export function getIstanbulToday(): string {
  const parts = new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Istanbul",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}
