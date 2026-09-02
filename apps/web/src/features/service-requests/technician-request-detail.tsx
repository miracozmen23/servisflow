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
  LockKeyhole,
  Mail,
  Package,
  ReceiptText,
  RotateCcw,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/page-heading";
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
  getTechnicianServiceRequestDetail,
  serviceRequestKeys,
} from "./service-requests-api";
import type {
  ServiceNote,
  TechnicianTimelineEvent,
} from "./service-request-types";
import { TechnicianNoteForm } from "./technician-note-form";
import { TechnicianStatusForm } from "./technician-status-form";

export function TechnicianRequestDetail({ requestId }: { requestId: string }) {
  const query = useQuery({
    queryKey: serviceRequestKeys.technicianDetail(requestId),
    queryFn: () => getTechnicianServiceRequestDetail(requestId),
  });

  if (query.isPending) {
    return <TechnicianDetailSkeleton />;
  }

  if (query.error !== null) {
    return (
      <TechnicianDetailError
        error={query.error}
        isFetching={query.isFetching}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const request = query.data;
  const currentStatus = statusMetadata[request.status];

  return (
    <div className="space-y-8">
      <Button asChild size="sm" variant="ghost">
        <Link href="/technician">
          <ArrowLeft />
          Servis kuyruğuna dön
        </Link>
      </Button>

      <PageHeading
        actions={
          <div className="flex flex-wrap gap-2">
            <RequestStatusBadge className="h-7 px-3" status={request.status} />
            <WarrantyBadge
              className="h-7 px-3"
              status={request.warrantyStatus}
            />
          </div>
        }
        description={currentStatus.description}
        eyebrow={request.rmaNumber}
        title={`${request.brand} ${request.model}`}
      />

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-5">
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Talep bilgileri</CardTitle>
              <CardDescription>
                Müşteri, cihaz ve kayıt sırasında alınan bilgiler.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <DetailField
                icon={UserRound}
                label="Müşteri"
                value={`${request.customer.firstName} ${request.customer.lastName}`}
              />
              <DetailField
                icon={Mail}
                label="E-posta"
                value={request.customer.email}
              />
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
                <CardDescription>
                  Talep kapanırken müşteriyle paylaşılan sonuç.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-7">
                  {request.resolutionSummary}
                </p>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="border-b">
              <CardTitle>İşlem geçmişi</CardTitle>
              <CardDescription>
                Durum değişiklikleri ve dahili not olayları, işlemi yapan
                kullanıcıyla birlikte gösterilir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {request.timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Henüz işlem kaydı bulunmuyor.
                </p>
              ) : (
                <ol>
                  {request.timeline.map((event, index) => (
                    <TechnicianTimelineItem
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

        <aside className="space-y-5 xl:sticky xl:top-28">
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Wrench className="size-4" />
                İş akışı kontrolü
              </CardTitle>
              <CardDescription>
                Mevcut durum: {currentStatus.label}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TechnicianStatusForm
                currentStatus={request.status}
                key={request.status}
                requestId={request.id}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <LockKeyhole className="size-4" />
                Dahili teknik notlar
              </CardTitle>
              <CardDescription>
                Bu içerikler müşteriye hiçbir zaman gösterilmez.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <TechnicianNoteForm requestId={request.id} />
              <Separator />
              {request.notes.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Bu talep için henüz dahili not eklenmedi.
                </p>
              ) : (
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {request.notes
                    .slice()
                    .reverse()
                    .map((note) => (
                      <TechnicalNoteItem key={note.id} note={note} />
                    ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="size-4" />
                Garanti bilgileri
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
        </aside>
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
      <span className="grid size-9 shrink-0 place-items-center bg-primary text-white">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

function TechnicalNoteItem({ note }: { note: ServiceNote }) {
  return (
    <article className="space-y-2 rounded-lg border bg-muted/30 p-3">
      <p className="whitespace-pre-wrap text-sm leading-6">{note.content}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {note.author.firstName} {note.author.lastName}
        </span>
        <time dateTime={note.createdAt}>{formatDateTime(note.createdAt)}</time>
      </div>
    </article>
  );
}

function TechnicianTimelineItem({
  event,
  isLast,
}: {
  event: TechnicianTimelineEvent;
  isLast: boolean;
}) {
  const title =
    event.newStatus === null
      ? eventTypeLabels[event.type]
      : statusMetadata[event.newStatus].label;

  return (
    <li className="grid grid-cols-[32px_1fr] gap-3">
      <div className="flex flex-col items-center">
        <span className="grid size-8 place-items-center rounded-full border bg-background text-primary">
          {event.type === "REQUEST_CREATED" ? (
            <FileText className="size-3.5" />
          ) : event.type === "NOTE_ADDED" ? (
            <LockKeyhole className="size-3.5" />
          ) : event.newStatus === "CLOSED" ? (
            <Check className="size-3.5" />
          ) : (
            <Wrench className="size-3.5" />
          )}
        </span>
        {!isLast ? <span className="min-h-8 w-px flex-1 bg-border" /> : null}
      </div>

      <div className={cn("space-y-2 pb-6", isLast && "pb-0")}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{title}</p>
          <Badge variant="secondary">
            {event.actor.firstName} {event.actor.lastName}
          </Badge>
        </div>

        {event.oldStatus !== null && event.newStatus !== null ? (
          <p className="text-xs text-muted-foreground">
            {statusMetadata[event.oldStatus].label} →{" "}
            {statusMetadata[event.newStatus].label}
          </p>
        ) : null}

        {event.customerMessage !== null ? (
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm leading-6 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-200">
            <span className="mb-1 block text-xs font-medium">
              Müşteri mesajı
            </span>
            {event.customerMessage}
          </div>
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

function TechnicianDetailError({
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
        <Link href="/technician">
          <ArrowLeft />
          Servis kuyruğuna dön
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

function TechnicianDetailSkeleton() {
  return (
    <div aria-label="Teknisyen talep detayı yükleniyor" className="space-y-7">
      <Skeleton className="h-8 w-44" />
      <div className="space-y-3">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-9 w-72 max-w-full" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
        <div className="space-y-5">
          <Skeleton className="h-72 w-full rounded-md" />
          <Skeleton className="h-44 w-full rounded-md" />
          <Skeleton className="h-80 w-full rounded-md" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-96 w-full rounded-md" />
          <Skeleton className="h-96 w-full rounded-md" />
        </div>
      </div>
    </div>
  );
}
