"use client";

import { useQuery } from "@tanstack/react-query";
import type { CandlePoint } from "@/lib/finnhub/types";

const THREE_MONTHS_SECONDS = 90 * 24 * 60 * 60;

export function useStockCandles(symbol: string, resolution: string = "D") {
  return useQuery({
    queryKey: ["stock-candles", symbol.toUpperCase(), resolution],
    queryFn: async (): Promise<CandlePoint[]> => {
      const to = Math.floor(Date.now() / 1000);
      const from = to - THREE_MONTHS_SECONDS;
      const res = await fetch(
        `/api/finnhub/candles?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}`,
      );
      if (!res.ok) throw new Error("Failed to fetch candles");
      const data = await res.json();
      return data.candles;
    },
    enabled: symbol.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
