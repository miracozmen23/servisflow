"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  CircleAlert,
  ClipboardCheck,
  FileText,
  Hash,
  Package,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { RequestStatusBadge, WarrantyBadge } from "./service-request-badges";
import {
  eventTypeLabels,
  formatCalendarDate,
  formatDateTime,
  statusMetadata,
} from "./service-request-metadata";
import {
  getServiceRequestDetail,
  serviceRequestKeys,
} from "./service-requests-api";
import type { CustomerTimelineEvent } from "./service-request-types";

export function ServiceRequestDetail({ requestId }: { requestId: string }) {
  const query = useQuery({
    queryKey: serviceRequestKeys.detail(requestId),
    queryFn: () => getServiceRequestDetail(requestId),
  });

  if (query.isPending) {
    return <RequestDetailSkeleton />;
  }

  if (query.error !== null) {
    return (
      <RequestDetailError
        error={query.error}
        isFetching={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const request = query.data;
  const currentStatus = statusMetadata[request.status];

  return (
    <div className="space-y-7">
      <div className="space-y-4">
        <Button asChild size="sm" variant="ghost">
          <Link href="/portal">
            <ArrowLeft />
            Taleplerime dön
          </Link>
        </Button>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 space-y-2">
            <p className="font-mono text-sm font-medium text-muted-foreground">
              {request.rmaNumber}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-tight">
              {request.brand} {request.model}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              {currentStatus.description}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <RequestStatusBadge className="h-7 px-3" status={request.status} />
            <WarrantyBadge
              className="h-7 px-3"
              status={request.warrantyStatus}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Cihaz ve servis bilgileri</CardTitle>
              <CardDescription>
                Talep oluşturulurken kaydedilen cihaz bilgileri.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <DetailField
                icon={Package}
                label="Cihaz"
                value={`${request.brand} ${request.model}`}
              />
              <DetailField
                icon={Hash}
                label="Seri numarası"
                value={request.serialNumber}
              />
              <DetailField
                icon={ReceiptText}
                label="Fatura numarası"
                value={request.invoiceNumber}
              />
              <DetailField
                icon={CalendarDays}
                label="Talep tarihi"
                value={formatDateTime(request.createdAt)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Problem açıklaması</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7">
                {request.problemDescription}
              </p>
            </CardContent>
          </Card>

          {request.resolutionSummary !== null ? (
            <Card className="ring-emerald-600/20">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="size-4 text-emerald-600" />
                  Çözüm özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-7">
                  {request.resolutionSummary}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Garanti sonucu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <WarrantyBadge status={request.warrantyStatus} />
              <Separator />
              <dl className="space-y-4 text-sm">
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Satın alma tarihi</dt>
                  <dd className="text-right font-medium">
                    {formatCalendarDate(request.purchaseDate)}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Garanti bitişi</dt>
                  <dd className="text-right font-medium">
                    {formatCalendarDate(request.warrantyExpiresAt)}
                  </dd>
                </div>
                {request.closedAt !== null ? (
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Kapanış zamanı</dt>
                    <dd className="text-right font-medium">
                      {formatDateTime(request.closedAt)}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle>Servis geçmişi</CardTitle>
              <CardDescription>
                Müşteriyle paylaşılabilen durum güncellemeleri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {request.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz paylaşılmış bir servis hareketi yok.
                </p>
              ) : (
                <ol className="space-y-0">
                  {request.timeline.map((event, index) => (
                    <TimelineItem
                      event={event}
                      isLast={index === request.timeline.length - 1}
                      key={event.id}
                    />
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="wrap-break-word font-medium">{value}</p>
      </div>
    </div>
  );
}

function TimelineItem({
  event,
  isLast,
}: {
  event: CustomerTimelineEvent;
  isLast: boolean;
}) {
  const title =
    event.newStatus === null
      ? eventTypeLabels[event.type]
      : statusMetadata[event.newStatus].label;

  return (
    <li className="grid grid-cols-[28px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <span className="grid size-7 place-items-center rounded-full border bg-background text-primary">
          {event.type === "REQUEST_CREATED" ? (
            <FileText className="size-3.5" />
          ) : event.newStatus === "CLOSED" ? (
            <Check className="size-3.5" />
          ) : (
            <Wrench className="size-3.5" />
          )}
        </span>
        {!isLast ? <span className="min-h-8 w-px flex-1 bg-border" /> : null}
      </div>
      <div className={cn("space-y-1 pb-6", isLast && "pb-0")}>
        <p className="text-sm font-medium">{title}</p>
        {event.customerMessage !== null ? (
          <p className="text-sm leading-6 text-muted-foreground">
            {event.customerMessage}
          </p>
        ) : null}
        <time
          className="block text-xs text-muted-foreground"
          dateTime={event.createdAt}
        >
          {formatDateTime(event.createdAt)}
        </time>
      </div>
    </li>
  );
}

function RequestDetailError({
  error,
  isFetching,
  onRetry,
}: {
  error: Error;
  isFetching: boolean;
  onRetry: () => void;
}) {
  const apiError = error instanceof ApiError ? error : null;
  const notFound = apiError?.statusCode === 404;
  const sessionExpired = apiError?.statusCode === 401;

  return (
    <div className="mx-auto max-w-xl space-y-4 pt-8">
      <Button asChild size="sm" variant="ghost">
        <Link href="/portal">
          <ArrowLeft />
          Taleplerime dön
        </Link>
      </Button>
      <Alert variant="destructive">
        <CircleAlert />
        <AlertTitle>
          {notFound
            ? "Talep bulunamadı"
            : sessionExpired
              ? "Oturum süresi doldu"
              : "Talep yüklenemedi"}
        </AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{error.message}</p>
          {sessionExpired ? (
            <Button asChild size="sm" variant="outline">
              <Link href="/login">Tekrar giriş yap</Link>
            </Button>
          ) : !notFound ? (
            <Button
              disabled={isFetching}
              onClick={onRetry}
              size="sm"
              type="button"
              variant="outline"
            >
              <RotateCcw className={isFetching ? "animate-spin" : undefined} />
              Tekrar dene
            </Button>
          ) : null}
        </AlertDescription>
      </Alert>
    </div>
  );
}

function RequestDetailSkeleton() {
  return (
    <div aria-label="Talep detayı yükleniyor" className="space-y-7">
      <Skeleton className="h-8 w-36" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <div className="space-y-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-44 w-full rounded-xl" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
