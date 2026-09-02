"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CircleAlert,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
  const [showPassword, setShowPassword] = useState(false);
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
      className="space-y-6"
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
        <div className="relative">
          <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
          <Input
            id="login-email"
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
        <Label htmlFor="login-password">Şifre</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground/65" />
          <Input
            id="login-password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            className="px-10"
            placeholder="Şifrenizi girin"
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
