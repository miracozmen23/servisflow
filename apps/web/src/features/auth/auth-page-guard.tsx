"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brand } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/client";
import { getRoleHomePath } from "./auth-routing";
import { useSession } from "./use-session";

interface AuthPageGuardProps {
  children: ReactNode;
}

export function AuthPageGuard({ children }: AuthPageGuardProps) {
  const router = useRouter();
  const { data: user, error, isPending, refetch, isFetching } = useSession();

  useEffect(() => {
    if (user !== undefined) {
      router.replace(getRoleHomePath(user.role));
    }
  }, [router, user]);

  if (isPending || user !== undefined) {
    return (
      <main className="relative grid min-h-svh place-items-center overflow-hidden bg-sidebar px-4 text-sidebar-foreground">
        <div className="sf-rule-grid pointer-events-none absolute inset-0 opacity-20" />
        <div className="relative flex flex-col items-center gap-6">
          <Brand inverse subtitle="Güvenli servis takibi" />
          <div className="flex items-center gap-2 text-xs font-medium text-sidebar-foreground/45">
            <LoaderCircle className="size-4 animate-spin text-primary" />
            Oturum kontrol ediliyor
          </div>
        </div>
      </main>
    );
  }

  if (
    error !== null &&
    !(error instanceof ApiError && error.statusCode === 401)
  ) {
    return (
      <main className="relative grid min-h-svh place-items-center overflow-hidden bg-background px-4">
        <div className="relative w-full max-w-md space-y-6">
          <Brand subtitle="Güvenli servis takibi" />
          <Alert className="p-5" variant="destructive">
            <AlertTitle>Oturum kontrolü tamamlanamadı</AlertTitle>
            <AlertDescription className="space-y-4">
              <p>
                {error instanceof Error
                  ? error.message
                  : "Sunucuya ulaşılamadı. Lütfen tekrar deneyin."}
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
        </div>
      </main>
    );
  }

  return children;
}
