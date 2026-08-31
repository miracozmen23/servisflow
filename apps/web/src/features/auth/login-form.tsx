"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/client";
import { authQueryKey, login } from "./auth-api";
import { getRoleHomePath } from "./auth-routing";
import { loginSchema, type LoginFormValues } from "./auth-schemas";

export function LoginForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (user) => {
      queryClient.setQueryData(authQueryKey, user);
      router.replace(getRoleHomePath(user.role));
    },
    onError: (error) => {
      form.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Giriş sırasında beklenmeyen bir hata oluştu.",
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
          <AlertTitle>Giriş yapılamadı</AlertTitle>
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="login-email">E-posta adresi</Label>
        <Input
          id="login-email"
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
        <Label htmlFor="login-password">Şifre</Label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          placeholder="En az 12 karakter"
          aria-invalid={form.formState.errors.password !== undefined}
          {...form.register("password")}
        />
        {form.formState.errors.password?.message !== undefined ? (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        ) : null}
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
          <LogIn />
        )}
        {mutation.isPending ? "Giriş yapılıyor..." : "Giriş yap"}
      </Button>
    </form>
  );
}
