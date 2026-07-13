"use client";

import { useQuotes } from "@/hooks/use-quotes";
import type { Holding } from "@/components/portfolio/holdings-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceBadge } from "@/components/stock/price-badge";
import { formatCurrency } from "@/lib/format";

export function GainLossSummaryCard({ holdings }: { holdings: Holding[] }) {
  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, isLoading } = useQuotes(symbols);

  const totalCost = holdings.reduce((sum, h) => sum + Number(h.cost_basis) * Number(h.shares), 0);
  const totalValue = holdings.reduce((sum, h) => {
    const price = quotes?.[h.symbol]?.price ?? 0;
    return sum + price * Number(h.shares);
  }, 0);
  const gainLoss = totalValue - totalCost;
  const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal text-muted-foreground">Gain / Loss</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {isLoading ? (
          <Skeleton className="h-20 w-full" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Invested</p>
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalCost)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Current value</p>
                <p className="text-lg font-semibold tabular-nums">{formatCurrency(totalValue)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xl font-semibold tabular-nums ${
                  isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                {isPositive ? "+" : "-"}
                {formatCurrency(Math.abs(gainLoss))}
              </span>
              <PriceBadge value={gainLossPercent} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
