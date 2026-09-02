"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  UserPlus,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
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
      className="space-y-6"
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
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
            <Input
              id="firstName"
              autoComplete="given-name"
              className="pl-10"
              placeholder="Ayşe"
              aria-invalid={form.formState.errors.firstName !== undefined}
              {...form.register("firstName")}
            />
          </div>
          {form.formState.errors.firstName?.message !== undefined ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.firstName.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Soyad</Label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
            <Input
              id="lastName"
              autoComplete="family-name"
              className="pl-10"
              placeholder="Yılmaz"
              aria-invalid={form.formState.errors.lastName !== undefined}
              {...form.register("lastName")}
            />
          </div>
          {form.formState.errors.lastName?.message !== undefined ? (
            <p className="text-xs text-destructive">
              {form.formState.errors.lastName.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">E-posta adresi</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
          <Input
            id="register-email"
            type="email"
            autoComplete="email"
            className="pl-10"
            placeholder="ornek@email.com"
            aria-invalid={form.formState.errors.email !== undefined}
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Şifre</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
          <Input
            id="register-password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="px-10"
            placeholder="En az 12 karakter"
            aria-describedby="password-help"
            aria-invalid={form.formState.errors.password !== undefined}
            {...form.register("password")}
          />
          <button
            aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            aria-pressed={showPassword}
            className="absolute top-1/2 right-2.5 grid size-7 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            onClick={() => setShowPassword((value) => !value)}
            type="button"
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
        {form.formState.errors.password?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : (
          <p id="password-help" className="text-xs text-muted-foreground">
            En az 12 karakter kullanın.
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
