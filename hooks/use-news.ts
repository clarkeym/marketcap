"use client";

import { useQuery } from "@tanstack/react-query";
import type { NewsItem } from "@/lib/finnhub/types";

export function useNews(symbol?: string) {
  return useQuery({
    queryKey: ["news", symbol ?? "general"],
    queryFn: async (): Promise<NewsItem[]> => {
      const url = symbol ? `/api/finnhub/news?symbol=${symbol}` : "/api/finnhub/news";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch news");
      const data = await res.json();
      return data.news;
    },
    enabled: typeof window !== "undefined",
    staleTime: 15 * 60 * 1000,
  });
}
