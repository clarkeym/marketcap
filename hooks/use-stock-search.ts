"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export type StockSearchResult = {
  symbol: string;
  displaySymbol: string;
  description: string;
};

export function useStockSearch(query: string) {
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return useQuery({
    queryKey: ["stock-search", debouncedQuery],
    queryFn: async (): Promise<StockSearchResult[]> => {
      const res = await fetch(`/api/finnhub/search?q=${encodeURIComponent(debouncedQuery)}`);
      if (!res.ok) throw new Error("Failed to search");
      const data = await res.json();
      return data.results;
    },
    enabled: debouncedQuery.trim().length > 0 && typeof window !== "undefined",
  });
}
