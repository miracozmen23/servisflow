"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Check,
  CircleAlert,
  LoaderCircle,
  Send,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/page-heading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import { getIstanbulToday } from "./service-request-metadata";
import {
  createServiceRequestSchema,
  type CreateServiceRequestFormValues,
} from "./service-request-schemas";
import {
  createServiceRequest,
  serviceRequestKeys,
} from "./service-requests-api";

export function CreateServiceRequestForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<CreateServiceRequestFormValues>({
    resolver: zodResolver(createServiceRequestSchema),
    defaultValues: {
      brand: "",
      model: "",
      serialNumber: "",
      invoiceNumber: "",
      purchaseDate: "",
      problemDescription: "",
    },
  });
  const mutation = useMutation({
    mutationFn: createServiceRequest,
    onMutate: () => form.clearErrors("root"),
    onSuccess: (request) => {
      void queryClient.invalidateQueries({ queryKey: serviceRequestKeys.all });
      toast.success("Servis talebiniz oluşturuldu.", {
        description: `${request.rmaNumber} numaralı talebin garanti sonucu hazır.`,
      });
      router.push(`/portal/requests/${request.id}`);
    },
    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Talep oluşturulurken beklenmeyen bir hata oluştu.",
      });
    },
  });
  const rootError = form.formState.errors.root?.message;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <Button asChild size="sm" variant="ghost">
        <Link href="/portal">
          <ArrowLeft />
          Taleplerime dön
        </Link>
      </Button>

      <PageHeading
        description="Cihaz ve fatura bilgilerini paylaşın; garanti sonucu talep oluşturulduğu anda otomatik hesaplansın."
        eyebrow="Yeni servis talebi"
        title="Cihazınızı servise kaydedin"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(15rem,0.42fr)_minmax(0,1fr)] lg:items-start">
        <aside className="overflow-hidden rounded-md bg-sidebar text-sidebar-foreground lg:sticky lg:top-28">
          <div className="relative aspect-[4/3] lg:aspect-[5/4]">
            <Image
              alt="Dizüstü bilgisayarın iç bileşenleri onarılıyor"
              className="object-cover opacity-80"
              fill
              sizes="(max-width: 1024px) 100vw, 32vw"
              src="/images/laptop-repair.jpg"
            />
            <div className="absolute inset-0 bg-linear-to-t from-sidebar via-transparent to-transparent" />
          </div>
          <div className="p-6 sm:p-7">
            <p className="sf-kicker text-primary">Başlamadan önce</p>
            <h2 className="mt-4 font-heading text-xl font-semibold tracking-[-0.035em] text-white">
              Bilgileri cihaz ve faturadan kontrol edin.
            </h2>
            <ul className="mt-6 space-y-3 text-sm text-sidebar-foreground/65">
              {[
                "Marka, model ve seri numarası",
                "Fatura numarası ve satın alma tarihi",
                "Sorunun açık ve ayrıntılı açıklaması",
              ].map((item) => (
                <li className="flex items-start gap-2.5" key={item}>
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Check className="size-3" strokeWidth={2.7} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-5">
      <Alert>
        <ShieldCheck />
        <AlertTitle>Garanti kontrolü hakkında</AlertTitle>
        <AlertDescription>
          Garanti bitiş tarihi satın alma tarihine 24 takvim ayı eklenerek
          hesaplanır ve bitiş günü kapsama dahildir. Ürün veya satıcıya özel ek
          koşullar bu otomatik kontrolde değerlendirilmez.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Talep bilgileri</CardTitle>
          <CardDescription>
            Cihaz ve fatura üzerindeki bilgileri eksiksiz girin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            noValidate
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
          >
            {rootError !== undefined ? (
              <Alert variant="destructive">
                <CircleAlert />
                <AlertTitle>Talep oluşturulamadı</AlertTitle>
                <AlertDescription>{rootError}</AlertDescription>
              </Alert>
            ) : null}

            <fieldset
              className="grid gap-5 sm:grid-cols-2"
              disabled={mutation.isPending}
            >
              <div className="space-y-2">
                <Label htmlFor="request-brand">Marka</Label>
                <Input
                  aria-invalid={form.formState.errors.brand !== undefined}
                  autoComplete="off"
                  id="request-brand"
                  maxLength={100}
                  placeholder="Örn. Lenovo"
                  {...form.register("brand")}
                />
                <FieldError message={form.formState.errors.brand?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-model">Model</Label>
                <Input
                  aria-invalid={form.formState.errors.model !== undefined}
                  autoComplete="off"
                  id="request-model"
                  maxLength={100}
                  placeholder="Örn. ThinkPad E14"
                  {...form.register("model")}
                />
                <FieldError message={form.formState.errors.model?.message} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-serial-number">Seri numarası</Label>
                <Input
                  aria-invalid={
                    form.formState.errors.serialNumber !== undefined
                  }
                  autoComplete="off"
                  className="font-mono"
                  id="request-serial-number"
                  maxLength={100}
                  placeholder="Örn. PF123456"
                  {...form.register("serialNumber")}
                />
                <FieldError
                  message={form.formState.errors.serialNumber?.message}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="request-invoice-number">Fatura numarası</Label>
                <Input
                  aria-invalid={
                    form.formState.errors.invoiceNumber !== undefined
                  }
                  autoComplete="off"
                  className="font-mono"
                  id="request-invoice-number"
                  maxLength={100}
                  placeholder="Örn. INV-2026-001"
                  {...form.register("invoiceNumber")}
                />
                <FieldError
                  message={form.formState.errors.invoiceNumber?.message}
                />
              </div>

              <div className="space-y-2 sm:col-span-2 sm:max-w-[calc(50%-0.625rem)]">
                <Label htmlFor="request-purchase-date">Satın alma tarihi</Label>
                <Input
                  aria-invalid={
                    form.formState.errors.purchaseDate !== undefined
                  }
                  id="request-purchase-date"
                  max={getIstanbulToday()}
                  type="date"
                  {...form.register("purchaseDate")}
                />
                <FieldError
                  message={form.formState.errors.purchaseDate?.message}
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <div className="flex items-end justify-between gap-3">
                  <Label htmlFor="request-problem-description">
                    Problem açıklaması
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    10–2000 karakter
                  </span>
                </div>
                <Textarea
                  aria-invalid={
                    form.formState.errors.problemDescription !== undefined
                  }
                  className="min-h-32 resize-y"
                  id="request-problem-description"
                  maxLength={2000}
                  placeholder="Cihazda yaşadığınız sorunu, ne zaman başladığını ve gözlemlediğiniz belirtileri açıklayın."
                  {...form.register("problemDescription")}
                />
                <FieldError
                  message={form.formState.errors.problemDescription?.message}
                />
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/portal">İptal</Link>
              </Button>
              <Button disabled={mutation.isPending} size="lg" type="submit">
                {mutation.isPending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}
                {mutation.isPending
                  ? "Talep oluşturuluyor..."
                  : "Garanti kontrolünü başlat"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  return message === undefined ? null : (
    <p className="text-xs text-destructive">{message}</p>
  );
}
