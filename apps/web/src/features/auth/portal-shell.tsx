"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LoaderCircle, LogOut, RotateCw, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import type { UserRole } from "@/lib/api/types";
import { authQueryKey, logout } from "./auth-api";
import { getRoleHomePath } from "./auth-routing";
import { useSession } from "./use-session";

interface PortalShellProps {
  children: ReactNode;
  requiredRole: UserRole;
}

export function PortalShell({ children, requiredRole }: PortalShellProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, error, isPending, isFetching, refetch } = useSession();
  const isUnauthorized = error instanceof ApiError && error.statusCode === 401;
  const hasWrongRole = user !== undefined && user.role !== requiredRole;
  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: authQueryKey });
      router.replace("/login");
    },
    onError: (logoutError) => {
      if (logoutError instanceof ApiError && logoutError.statusCode === 401) {
        queryClient.removeQueries({ queryKey: authQueryKey });
        router.replace("/login");
        return;
      }

      toast.error(
        logoutError instanceof Error
          ? logoutError.message
          : "Oturum kapatılamadı.",
      );
    },
  });

  useEffect(() => {
    if (isUnauthorized) {
      router.replace("/login");
    }
  }, [isUnauthorized, router]);

  useEffect(() => {
    if (hasWrongRole && user !== undefined) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [hasWrongRole, router, user]);

  if (isPending || isUnauthorized || hasWrongRole) {
    return (
      <main className="grid min-h-svh place-items-center bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Oturum doğrulanıyor...
        </div>
      </main>
    );
  }

  if (error !== null || user === undefined) {
    return (
      <main className="grid min-h-svh place-items-center bg-muted/30 px-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertTitle>Portal yüklenemedi</AlertTitle>
          <AlertDescription className="space-y-3">
            <p>
              {error instanceof Error
                ? error.message
                : "Oturum bilgileri alınamadı."}
            </p>
            <Button
              disabled={isFetching}
              onClick={() => void refetch()}
              size="sm"
              type="button"
              variant="outline"
            >
              <RotateCw className={isFetching ? "animate-spin" : undefined} />
              Tekrar dene
            </Button>
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link
            className="flex items-center gap-2 font-heading font-semibold"
            href={getRoleHomePath(user.role)}
          >
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="size-4" />
            </span>
            ServisFlow
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Badge variant="secondary">
              {user.role === "CUSTOMER" ? "Müşteri" : "Teknisyen"}
            </Badge>
            <Button
              aria-label="Oturumu kapat"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              size="icon"
              type="button"
              variant="ghost"
            >
              {logoutMutation.isPending ? (
                <LoaderCircle className="animate-spin" />
              ) : (
                <LogOut />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {children}
      </main>
    </div>
  );
}
