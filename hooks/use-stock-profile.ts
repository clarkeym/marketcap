"use client";

import { useQuery } from "@tanstack/react-query";
import type { StockProfile } from "@/lib/finnhub/types";

export function useStockProfile(symbol: string) {
  return useQuery({
    queryKey: ["stock-profile", symbol.toUpperCase()],
    queryFn: async (): Promise<StockProfile> => {
      const res = await fetch(`/api/finnhub/profile?symbol=${symbol}`);
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      return data.profile;
    },
    enabled: symbol.length > 0,
    staleTime: 60 * 60 * 1000,
  });
}
