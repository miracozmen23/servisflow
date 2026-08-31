"use client";

import { useQuery } from "@tanstack/react-query";
import { authQueryKey, getCurrentUser } from "./auth-api";

export function useSession() {
  return useQuery({
    queryKey: authQueryKey,
    queryFn: getCurrentUser,
  });
}
