"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { useState, type ReactNode } from "react";
import { ServerAvailability } from "@/components/server-availability";
import { Toaster } from "@/components/ui/sonner";
import { ApiError } from "@/lib/api/client";

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: (failureCount, error) =>
              failureCount < 5 &&
              (!(error instanceof ApiError) || error.statusCode >= 500),
            retryDelay: (attemptIndex) =>
              Math.min(2_000 * 2 ** attemptIndex, 10_000),
            staleTime: 30_000,
          },
          mutations: {
            retry: false,
          },
        },
      }),
  );

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      disableTransitionOnChange
      enableSystem={false}
      forcedTheme="light"
    >
      <QueryClientProvider client={queryClient}>
        {children}
        <ServerAvailability />
        <Toaster closeButton position="top-right" richColors />
      </QueryClientProvider>
    </ThemeProvider>
  );
}
