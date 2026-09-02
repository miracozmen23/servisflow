"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ClipboardList,
  LoaderCircle,
  LogOut,
  Plus,
  RotateCw,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brand } from "@/components/brand";
import { cn } from "@/lib/utils";
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
  const pathname = usePathname();
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
      <main className="grid min-h-svh place-items-center bg-background">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Oturum doğrulanıyor...
        </div>
      </main>
    );
  }

  if (error !== null || user === undefined) {
    return (
      <main className="grid min-h-svh place-items-center bg-background px-4">
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

  const navigation =
    requiredRole === "CUSTOMER"
      ? [
          {
            href: "/portal",
            icon: ClipboardList,
            label: "Taleplerim",
          },
          {
            href: "/portal/requests/new",
            icon: Plus,
            label: "Yeni talep",
          },
        ]
      : [
          {
            href: "/technician",
            icon: Wrench,
            label: "Servis kuyruğu",
          },
        ];
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;

  function isActiveNavigationItem(href: string): boolean {
    if (href === "/portal/requests/new") {
      return pathname === href;
    }

    if (href === "/portal") {
      return pathname.startsWith("/portal") && pathname !== "/portal/requests/new";
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-30 border-b border-sidebar-border bg-sidebar text-sidebar-foreground">
        <div className="mx-auto flex h-[4.75rem] max-w-[90rem] items-center gap-5 px-5 sm:px-8 lg:px-12">
          <Brand
            className="shrink-0"
            href={getRoleHomePath(user.role)}
            inverse
            subtitle={
              user.role === "CUSTOMER" ? "Müşteri portalı" : "Teknik operasyon"
            }
          />

          <nav
            aria-label="Portal navigasyonu"
            className="ml-4 hidden h-full items-center gap-1 md:flex"
          >
            {navigation.map(({ href, icon: Icon, label }) => {
              const isActive = isActiveNavigationItem(href);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "relative flex h-full items-center gap-2 px-3 text-sm font-semibold text-sidebar-foreground/55 transition-colors outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-inset",
                    isActive && "text-white",
                  )}
                  href={href}
                  key={href}
                >
                  <Icon className="size-4" />
                  {label}
                  {isActive ? (
                    <span className="absolute right-3 bottom-0 left-3 h-[3px] bg-primary" />
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <span className="grid size-9 place-items-center rounded-full bg-primary text-xs font-bold tracking-wide text-white">
              {initials.toLocaleUpperCase("tr-TR")}
            </span>
            <div className="hidden min-w-0 text-left lg:block">
              <p className="max-w-44 truncate text-sm font-semibold text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="max-w-44 truncate text-[0.6875rem] text-sidebar-foreground/45">
                {user.email}
              </p>
            </div>
            <Badge
              className="hidden border-white/20 bg-white/5 text-white shadow-none sm:inline-flex"
              variant="outline"
            >
              {user.role === "CUSTOMER" ? "Müşteri" : "Teknisyen"}
            </Badge>
            <Button
              aria-label="Oturumu kapat"
              className="text-sidebar-foreground/55 shadow-none hover:bg-white/10 hover:text-white"
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

      <nav
        aria-label="Mobil portal navigasyonu"
        className="sticky top-[4.75rem] z-20 border-b border-sidebar-border bg-sidebar px-5 md:hidden"
      >
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto py-2">
          {navigation.map(({ href, icon: Icon, label }) => {
            const isActive = isActiveNavigationItem(href);

            return (
              <Link
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-sidebar-foreground/55 transition-colors",
                  isActive && "bg-primary text-white",
                )}
                href={href}
                key={href}
              >
                <Icon className="size-3.5" />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>

      <main className="relative min-h-[calc(100svh-4.75rem)] overflow-hidden bg-background">
        <div className="sf-page-enter relative mx-auto max-w-[90rem] px-5 py-8 sm:px-8 sm:py-11 lg:px-12 lg:py-12">
          {children}
        </div>
      </main>
    </div>
  );
}
