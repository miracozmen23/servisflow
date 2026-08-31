"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { authQueryKey, register } from "./auth-api";
import { getRoleHomePath } from "./auth-routing";
import { registerSchema, type RegisterFormValues } from "./auth-schemas";

export function RegisterForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });
  const mutation = useMutation({
    mutationFn: register,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKey, user);
      router.replace(getRoleHomePath(user.role));
    },
    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Kayıt sırasında beklenmeyen bir hata oluştu.",
      });
    },
  });

  const rootError = form.formState.errors.root?.message;

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
    >
      {rootError !== undefined ? (
        <Alert variant="destructive">
          <CircleAlert />
          <AlertTitle>Kayıt oluşturulamadı</AlertTitle>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Ad</Label>
          <Input
            id="firstName"
            autoComplete="given-name"
            placeholder="Ayşe"
            aria-invalid={form.formState.errors.firstName !== undefined}
            {...form.register("firstName")}
          />
          {form.formState.errors.firstName?.message !== undefined ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            autoComplete="family-name"
            placeholder="Yılmaz"
            aria-invalid={form.formState.errors.lastName !== undefined}
            {...form.register("lastName")}
          />
          {form.formState.errors.lastName?.message !== undefined ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">E-posta adresi</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="ornek@email.com"
          aria-invalid={form.formState.errors.email !== undefined}
          {...form.register("email")}
        />
        {form.formState.errors.email?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Şifre</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="En az 12 karakter"
          aria-describedby="password-help"
          aria-invalid={form.formState.errors.password !== undefined}
          {...form.register("password")}
        />
        {form.formState.errors.password?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : (
          <p id="password-help" className="text-xs text-muted-foreground">
            En az 12 karakter; UTF-8 biçiminde en fazla 72 bayt.
          </p>
        )}
      </div>

      <Button
        className="w-full"
        disabled={mutation.isPending}
        size="lg"
        type="submit"
      >
        {mutation.isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <UserPlus />
        )}
        {mutation.isPending ? "Hesap oluşturuluyor..." : "Hesap oluştur"}
      </Button>
    </form>
  );
}
