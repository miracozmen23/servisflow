"use client";

import { LoaderCircle, RefreshCw, ServerOff } from "lucide-react";
import { useEffect, useState } from "react";

const BANNER_REVEAL_DELAY_MS = 1_500;
const HEALTH_REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAYS_MS = [0, 4_000, 8_000, 12_000, 16_000, 20_000];

type AvailabilityState = "checking" | "starting" | "online" | "offline";

function wait(delay: number, signal: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    if (signal.aborted) {
      resolve(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      signal.removeEventListener("abort", handleAbort);
      resolve(true);
    }, delay);

    function handleAbort() {
      window.clearTimeout(timeoutId);
      resolve(false);
    }

    signal.addEventListener("abort", handleAbort, { once: true });
  });
}

async function requestHealth(signal: AbortSignal): Promise<boolean> {
  const requestController = new AbortController();
  const timeoutId = window.setTimeout(
    () => requestController.abort(),
    HEALTH_REQUEST_TIMEOUT_MS,
  );
  const handleAbort = () => requestController.abort();

  signal.addEventListener("abort", handleAbort, { once: true });

  try {
    const response = await fetch("/api/health", {
      cache: "no-store",
      credentials: "include",
      signal: requestController.signal,
    });

    return response.ok;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeoutId);
    signal.removeEventListener("abort", handleAbort);
  }
}

export function ServerAvailability() {
  const [availability, setAvailability] =
    useState<AvailabilityState>("checking");
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const revealTimer = window.setTimeout(
      () => setAvailability((current) =>
        current === "checking" ? "starting" : current,
      ),
      BANNER_REVEAL_DELAY_MS,
    );

    async function checkAvailability() {
      setAvailability("checking");

      for (const delay of RETRY_DELAYS_MS) {
        if (delay > 0) {
          setAvailability("starting");
        }

        const shouldContinue = await wait(delay, controller.signal);
        if (!shouldContinue) {
          return;
        }

        if (await requestHealth(controller.signal)) {
          window.clearTimeout(revealTimer);
          setAvailability("online");
          return;
        }

        if (controller.signal.aborted) {
          return;
        }

        setAvailability("starting");
      }

      setAvailability("offline");
    }

    void checkAvailability();

    return () => {
      window.clearTimeout(revealTimer);
      controller.abort();
    };
  }, [retryKey]);

  if (availability === "checking" || availability === "online") {
    return null;
  }

  const isStarting = availability === "starting";

  return (
    <aside
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-start gap-3 rounded-xl border border-white/15 bg-[#082f35] px-4 py-3 text-white shadow-2xl sm:items-center"
      role="status"
    >
      {isStarting ? (
        <LoaderCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 animate-spin text-[#f37a32] sm:mt-0" />
      ) : (
        <ServerOff aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#f37a32] sm:mt-0" />
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold">
          {isStarting ? "Servis sunucusu başlatılıyor" : "Sunucuya ulaşılamadı"}
        </p>
        <p className="mt-0.5 text-sm leading-5 text-white/70">
          {isStarting
            ? "İlk bağlantı yaklaşık bir dakika sürebilir. Sayfayı açık tutabilirsiniz."
            : "Bağlantınızı kontrol edip yeniden deneyin."}
        </p>
      </div>
      {!isStarting && (
        <button
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-white/20 px-3 py-2 text-sm font-semibold transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f37a32]"
          onClick={() => setRetryKey((current) => current + 1)}
          type="button"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Tekrar dene
        </button>
      )}
    </aside>
  );
}
