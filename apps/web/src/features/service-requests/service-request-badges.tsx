import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  statusMetadata,
  warrantyMetadata,
} from "./service-request-metadata";
import type {
  ServiceRequestStatus,
  WarrantyStatus,
} from "./service-request-types";

export function RequestStatusBadge({
  className,
  status,
}: {
  className?: string;
  status: ServiceRequestStatus;
}) {
  const metadata = statusMetadata[status];

  return (
    <Badge
      className={cn("gap-1.5 border font-bold", metadata.badgeClassName, className)}
      variant="outline"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {metadata.label}
    </Badge>
  );
}

export function WarrantyBadge({
  className,
  status,
}: {
  className?: string;
  status: WarrantyStatus;
}) {
  const metadata = warrantyMetadata[status];

  return (
    <Badge
      className={cn("gap-1.5 border font-bold", metadata.badgeClassName, className)}
      variant="outline"
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {metadata.label}
    </Badge>
  );
}
