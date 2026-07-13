"use client";

import { useQuery } from "@tanstack/react-query";
import type { Quote } from "@/lib/finnhub/types";

const POLL_INTERVAL_MS = 20_000;

export function useQuotes(symbols: string[]) {
  const uniqueSymbols = Array.from(new Set(symbols.map((s) => s.toUpperCase()))).sort();

  return useQuery({
    queryKey: ["quotes", uniqueSymbols],
    queryFn: async (): Promise<Record<string, Quote>> => {
      const res = await fetch(`/api/finnhub/quote?symbols=${uniqueSymbols.join(",")}`);
      if (!res.ok) throw new Error("Failed to fetch quotes");
      const data = await res.json();
      return data.quotes;
    },
    enabled: uniqueSymbols.length > 0 && typeof window !== "undefined",
    refetchInterval: POLL_INTERVAL_MS,
  });
}
