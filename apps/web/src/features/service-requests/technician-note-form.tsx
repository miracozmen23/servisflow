"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, LockKeyhole, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/client";
import {
  addServiceRequestNote,
  serviceRequestKeys,
} from "./service-requests-api";
import {
  createServiceNoteSchema,
  type CreateServiceNoteFormValues,
} from "./technician-request-schemas";

export function TechnicianNoteForm({ requestId }: { requestId: string }) {
  const queryClient = useQueryClient();
  const form = useForm<CreateServiceNoteFormValues>({
    resolver: zodResolver(createServiceNoteSchema),
    defaultValues: { content: "" },
  });
  const mutation = useMutation({
    mutationFn: (values: CreateServiceNoteFormValues) =>
      addServiceRequestNote({ requestId, input: values }),
    onMutate: () => form.clearErrors("root"),
    onSuccess: async () => {
      form.reset();
      await queryClient.invalidateQueries({
        queryKey: serviceRequestKeys.technicianDetail(requestId),
      });
      toast.success("Dahili teknik not eklendi.");
    },
    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Teknik not eklenirken beklenmeyen bir hata oluştu.",
      });
    },
  });
  const rootError = form.formState.errors.root?.message;

  return (
    <form
      className="space-y-4"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      {rootError !== undefined ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Not eklenemedi</AlertTitle>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="technician-note">Yeni teknik not</Label>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <LockKeyhole className="size-3" />
            Yalnız teknisyenler
          </span>
        </div>
        <Textarea
          aria-invalid={form.formState.errors.content !== undefined}
          className="min-h-28 resize-y"
          disabled={mutation.isPending}
          id="technician-note"
          maxLength={2000}
          placeholder="Teşhis bulguları, yapılan kontroller veya sonraki işlem..."
          {...form.register("content")}
        />
        {form.formState.errors.content?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.content.message}
          </p>
        ) : null}
      </div>

      <Button
        className="w-full"
        disabled={mutation.isPending}
        type="submit"
        variant="secondary"
      >
        {mutation.isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Plus />
        )}
        {mutation.isPending ? "Not ekleniyor..." : "Dahili not ekle"}
      </Button>
    </form>
  );
}
