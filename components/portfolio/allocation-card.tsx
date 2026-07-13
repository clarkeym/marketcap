"use client";

import { useQuotes } from "@/hooks/use-quotes";
import type { Holding } from "@/components/portfolio/holdings-table";
import { AllocationBarList } from "@/components/portfolio/allocation-bar-list";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function AllocationCard({ holdings }: { holdings: Holding[] }) {
  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, isLoading } = useQuotes(symbols);

  const rows = holdings.map((h) => {
    const price = quotes?.[h.symbol]?.price ?? 0;
    return { label: h.symbol, value: price * Number(h.shares) };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal text-muted-foreground">Allocation</CardTitle>
      </CardHeader>
      <CardContent>{isLoading ? <Skeleton className="h-32 w-full" /> : <AllocationBarList rows={rows} />}</CardContent>
    </Card>
  );
}
