"use client";

import { LoaderCircle, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
      <main className="grid min-h-svh place-items-center bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Oturum kontrol ediliyor...
        </div>
      </main>
    );
  }

  if (
    error !== null &&
    !(error instanceof ApiError && error.statusCode === 401)
  ) {
    return (
      <main className="grid min-h-svh place-items-center bg-muted/30 px-4">
        <Alert className="max-w-md" variant="destructive">
          <AlertTitle>Oturum kontrolü tamamlanamadı</AlertTitle>
          <AlertDescription className="space-y-3">
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
      </main>
    );
  }

  return children;
}
