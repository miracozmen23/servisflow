"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, RefreshCw } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  allowedNextStatuses,
  resolutionRequiredStatuses,
  statusMetadata,
} from "./service-request-metadata";
import {
  serviceRequestKeys,
  updateServiceRequestStatus,
} from "./service-requests-api";
import type { ServiceRequestStatus } from "./service-request-types";
import {
  updateServiceRequestStatusSchema,
  type UpdateServiceRequestStatusFormValues,
} from "./technician-request-schemas";

export function TechnicianStatusForm({
  currentStatus,
  requestId,
}: {
  currentStatus: ServiceRequestStatus;
  requestId: string;
}) {
  const queryClient = useQueryClient();
  const nextStatuses = allowedNextStatuses[currentStatus];
  const defaultStatus = nextStatuses[0];
  const form = useForm<UpdateServiceRequestStatusFormValues>({
    resolver: zodResolver(updateServiceRequestStatusSchema),
    defaultValues: {
      status: defaultStatus ?? currentStatus,
      customerMessage: "",
      resolutionSummary: "",
    },
  });
  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });
  const needsResolution = resolutionRequiredStatuses.has(selectedStatus);
  const mutation = useMutation({
    mutationFn: (values: UpdateServiceRequestStatusFormValues) =>
      updateServiceRequestStatus({
        requestId,
        input: {
          status: values.status,
          ...(values.customerMessage.length === 0
            ? {}
            : { customerMessage: values.customerMessage }),
          ...(needsResolution && values.resolutionSummary.length > 0
            ? { resolutionSummary: values.resolutionSummary }
            : {}),
        },
      }),
    onMutate: () => form.clearErrors("root"),
    onSuccess: async (request) => {
      await queryClient.invalidateQueries({ queryKey: serviceRequestKeys.all });
      toast.success("Talep durumu güncellendi.", {
        description: `${request.rmaNumber}: ${statusMetadata[request.status].label}`,
      });
    },
    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Durum güncellenirken beklenmeyen bir hata oluştu.",
      });
    },
  });
  const rootError = form.formState.errors.root?.message;

  if (defaultStatus === undefined) {
    return (
      <Alert>
        <CircleAlert />
        <AlertTitle>İş akışı tamamlandı</AlertTitle>
        <AlertDescription>
          Bu talep kapandığı için durumu değiştirilemez. Dahili teknik not
          eklemeye devam edebilirsiniz.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      {rootError !== undefined ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Durum güncellenemedi</AlertTitle>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <fieldset className="space-y-5" disabled={mutation.isPending}>
        <div className="space-y-2">
          <Label htmlFor="technician-next-status">Sonraki durum</Label>
          <select
            aria-invalid={form.formState.errors.status !== undefined}
            className="h-12 w-full rounded-sm border border-input bg-card px-4 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
            id="technician-next-status"
            {...form.register("status")}
          >
            {nextStatuses.map((status) => (
              <option key={status} value={status}>
                {statusMetadata[status].label}
              </option>
            ))}
          </select>
          <FieldError message={form.formState.errors.status?.message} />
        </div>

        <div className="space-y-2">
          <div className="flex items-end justify-between gap-3">
            <Label htmlFor="technician-customer-message">
              Müşteri mesajı
            </Label>
            <span className="text-xs text-muted-foreground">Opsiyonel</span>
          </div>
          <Textarea
            aria-invalid={
              form.formState.errors.customerMessage !== undefined
            }
            className="min-h-24 resize-y"
            id="technician-customer-message"
            maxLength={500}
            placeholder="Müşteriye gösterilecek kısa açıklama"
            {...form.register("customerMessage")}
          />
          <FieldError
            message={form.formState.errors.customerMessage?.message}
          />
        </div>

        {needsResolution ? (
          <div className="space-y-2">
            <div className="flex items-end justify-between gap-3">
              <Label htmlFor="technician-resolution-summary">
                Çözüm özeti
              </Label>
              <span className="text-xs text-muted-foreground">
                Zorunlu · 10–500 karakter
              </span>
            </div>
            <Textarea
              aria-invalid={
                form.formState.errors.resolutionSummary !== undefined
              }
              className="min-h-28 resize-y"
              id="technician-resolution-summary"
              maxLength={500}
              placeholder="Yapılan işlemi veya cihazın neden onarılamadığını müşteriye uygun biçimde açıklayın."
              {...form.register("resolutionSummary")}
            />
            <FieldError
              message={form.formState.errors.resolutionSummary?.message}
            />
          </div>
        ) : null}
      </fieldset>

      <Button className="w-full" disabled={mutation.isPending} type="submit">
        {mutation.isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <RefreshCw />
        )}
        {mutation.isPending ? "Durum güncelleniyor..." : "Durumu güncelle"}
      </Button>
    </form>
  );
}

function FieldError({ message }: { message?: string }) {
  return message === undefined ? null : (
    <p className="text-xs text-destructive">{message}</p>
  );
}
