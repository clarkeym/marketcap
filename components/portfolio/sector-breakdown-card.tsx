"use client";

import { useQueries } from "@tanstack/react-query";
import { useQuotes } from "@/hooks/use-quotes";
import type { Holding } from "@/components/portfolio/holdings-table";
import type { StockProfile } from "@/lib/finnhub/types";
import { AllocationBarList } from "@/components/portfolio/allocation-bar-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function SectorBreakdownCard({ holdings }: { holdings: Holding[] }) {
  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, isLoading: quotesLoading } = useQuotes(symbols);

  const profileQueries = useQueries({
    queries: symbols.map((symbol) => ({
      queryKey: ["stock-profile", symbol],
      queryFn: async (): Promise<StockProfile> => {
        const res = await fetch(`/api/finnhub/profile?symbol=${symbol}`);
        if (!res.ok) throw new Error("Failed to fetch profile");
        const data = await res.json();
        return data.profile;
      },
      staleTime: 60 * 60 * 1000,
    })),
  });

  const isLoading = quotesLoading || profileQueries.some((q) => q.isLoading);

  const sectorTotals = new Map<string, number>();
  holdings.forEach((h, i) => {
    const price = quotes?.[h.symbol]?.price ?? 0;
    const value = price * Number(h.shares);
    const industry = profileQueries[i]?.data?.industry || "Other";
    sectorTotals.set(industry, (sectorTotals.get(industry) ?? 0) + value);
  });

  const rows = Array.from(sectorTotals.entries()).map(([label, value]) => ({ label, value }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal text-muted-foreground">Sector Breakdown</CardTitle>
      </CardHeader>
      <CardContent>{isLoading ? <Skeleton className="h-32 w-full" /> : <AllocationBarList rows={rows} />}</CardContent>
    </Card>
  );
}
