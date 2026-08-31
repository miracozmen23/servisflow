"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Inbox,
  LoaderCircle,
  Mail,
  RotateCcw,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/client";
import { RequestStatusBadge, WarrantyBadge } from "./service-request-badges";
import {
  formatDateTime,
  serviceRequestStatuses,
  statusMetadata,
} from "./service-request-metadata";
import {
  listTechnicianServiceRequests,
  serviceRequestKeys,
} from "./service-requests-api";
import type { ServiceRequestStatus } from "./service-request-types";

const PAGE_SIZE = 10;

export function TechnicianRequestList() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ServiceRequestStatus | undefined>();
  const params = { page, limit: PAGE_SIZE, search, status };
  const query = useQuery({
    queryKey: serviceRequestKeys.technicianList(params),
    queryFn: () => listTechnicianServiceRequests(params),
    placeholderData: keepPreviousData,
  });
  const total = query.data?.meta.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hasFilters = search.length > 0 || status !== undefined;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  }

  function clearFilters() {
    setSearchInput("");
    setSearch("");
    setStatus(undefined);
    setPage(1);
  }

  return (
    <div className="space-y-7">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">
            Teknik servis
          </p>
          <h1 className="font-heading text-3xl font-semibold tracking-tight">
            Servis kuyruğu
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Tüm servis taleplerini inceleyin, teknik süreci ilerletin ve servis
            kayıtlarını yönetin.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-xs">
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Wrench className="size-4" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Görüntülenen kayıt</p>
            <p className="text-lg font-semibold tabular-nums">{total}</p>
          </div>
        </div>
      </section>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Kuyrukta ara</CardTitle>
          <CardDescription>
            RMA veya seri numarasıyla arayın ve işlem durumuna göre filtreleyin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(220px,0.35fr)_auto]"
            onSubmit={handleSearch}
          >
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                aria-label="RMA veya seri numarası ara"
                className="h-10 pl-9"
                maxLength={100}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Örn. RMA-2026 veya PF123456"
                type="search"
                value={searchInput}
              />
            </div>

            <select
              aria-label="Talep durumu"
              className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              onChange={(event) => {
                setStatus(
                  event.target.value === ""
                    ? undefined
                    : (event.target.value as ServiceRequestStatus),
                );
                setPage(1);
              }}
              value={status ?? ""}
            >
              <option value="">Tüm durumlar</option>
              {serviceRequestStatuses.map((value) => (
                <option key={value} value={value}>
                  {statusMetadata[value].label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <Button className="h-10 flex-1 lg:flex-none" type="submit">
                <Search />
                Ara
              </Button>
              {hasFilters ? (
                <Button
                  aria-label="Filtreleri temizle"
                  className="h-10"
                  onClick={clearFilters}
                  type="button"
                  variant="outline"
                >
                  <RotateCcw />
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {query.isPending ? <TechnicianListSkeleton /> : null}

      {query.error !== null ? (
        <TechnicianListError
          error={query.error}
          isFetching={query.isFetching}
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {query.data !== undefined && query.error === null ? (
        <section aria-busy={query.isFetching} className="space-y-4">
          <div className="flex min-h-6 items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              {total === 0 ? "Talep bulunamadı" : `${total} talep bulundu`}
            </p>
            {query.isFetching ? (
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                <LoaderCircle className="size-3.5 animate-spin" />
                Güncelleniyor
              </span>
            ) : null}
          </div>

          {query.data.data.length === 0 ? (
            <EmptyTechnicianQueue
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <div className="space-y-3">
              {query.data.data.map((request) => (
                <Link
                  className="group block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  href={`/technician/requests/${request.id}`}
                  key={request.id}
                >
                  <Card className="transition-[transform,box-shadow] group-hover:-translate-y-0.5 group-hover:shadow-md">
                    <CardContent className="grid gap-5 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)_auto] md:items-center">
                      <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-mono text-xs font-medium text-muted-foreground">
                            {request.rmaNumber}
                          </p>
                          <RequestStatusBadge status={request.status} />
                        </div>
                        <h2 className="truncate font-heading text-lg font-semibold">
                          {request.brand} {request.model}
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          Seri no: {request.serialNumber}
                        </p>
                      </div>

                      <div className="min-w-0 space-y-2 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-5">
                        <p className="flex items-center gap-2 truncate text-sm font-medium">
                          <UserRound className="size-4 shrink-0 text-muted-foreground" />
                          {request.customer.firstName} {request.customer.lastName}
                        </p>
                        <p className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                          <Mail className="size-3.5 shrink-0" />
                          {request.customer.email}
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                          <WarrantyBadge status={request.warrantyStatus} />
                          <time
                            className="text-xs text-muted-foreground"
                            dateTime={request.createdAt}
                          >
                            {formatDateTime(request.createdAt)}
                          </time>
                        </div>
                      </div>

                      <ArrowRight className="hidden size-5 text-muted-foreground transition-transform group-hover:translate-x-1 md:block" />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {totalPages > 1 ? (
            <nav
              aria-label="Teknik servis kuyruğu sayfaları"
              className="flex items-center justify-between border-t pt-5"
            >
              <Button
                disabled={page <= 1 || query.isFetching}
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                type="button"
                variant="outline"
              >
                <ChevronLeft />
                Önceki
              </Button>
              <span className="text-sm text-muted-foreground">
                Sayfa {page} / {totalPages}
              </span>
              <Button
                disabled={page >= totalPages || query.isFetching}
                onClick={() =>
                  setPage((value) => Math.min(totalPages, value + 1))
                }
                type="button"
                variant="outline"
              >
                Sonraki
                <ChevronRight />
              </Button>
            </nav>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

function TechnicianListSkeleton() {
  return (
    <div aria-label="Servis kuyruğu yükleniyor" className="space-y-3">
      <Skeleton className="h-5 w-36" />
      {Array.from({ length: 4 }, (_, index) => (
        <Skeleton className="h-36 w-full rounded-xl md:h-28" key={index} />
      ))}
    </div>
  );
}

function TechnicianListError({
  error,
  isFetching,
  onRetry,
}: {
  error: Error;
  isFetching: boolean;
  onRetry: () => void;
}) {
  const sessionExpired = error instanceof ApiError && error.statusCode === 401;

  return (
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>
        {sessionExpired ? "Oturum süresi doldu" : "Servis kuyruğu yüklenemedi"}
      </AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{error.message}</p>
        {sessionExpired ? (
          <Button asChild size="sm" variant="outline">
            <Link href="/login">Tekrar giriş yap</Link>
          </Button>
        ) : (
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
        )}
      </AlertDescription>
    </Alert>
  );
}

function EmptyTechnicianQueue({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <Card className="border-dashed py-12 text-center">
      <CardContent className="mx-auto flex max-w-md flex-col items-center gap-4">
        <span className="grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
          {hasFilters ? (
            <Search className="size-6" />
          ) : (
            <Inbox className="size-6" />
          )}
        </span>
        <div className="space-y-1">
          <h2 className="font-heading text-lg font-semibold">
            {hasFilters ? "Eşleşen talep bulunamadı" : "Servis kuyruğu boş"}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {hasFilters
              ? "Arama veya durum filtresini değiştirerek yeniden deneyin."
              : "Müşteriler yeni servis talebi oluşturduğunda burada görünecek."}
          </p>
        </div>
        {hasFilters ? (
          <Button onClick={onClear} type="button" variant="outline">
            <RotateCcw />
            Filtreleri temizle
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
