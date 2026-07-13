"use client";

import { useMemo, useState } from "react";
import { useQuotes } from "@/hooks/use-quotes";
import { PortfolioValueCard } from "@/components/portfolio/portfolio-value-card";
import { StockCardRow } from "@/components/portfolio/stock-card-row";
import { StatisticsChart, type StatisticsChartPoint } from "@/components/stock/statistics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HoldingsTable, type Holding } from "@/components/portfolio/holdings-table";

export function OverviewDashboard({
  holdings,
  history,
}: {
  holdings: Holding[];
  history: { date: string; total_value: string }[];
}) {
  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, isLoading } = useQuotes(symbols);
  const [sortDir, setSortDir] = useState<"best" | "worst" | null>(null);

  const holdingsWithValue = useMemo(() => {
    return holdings.map((h) => {
      const quote = quotes?.[h.symbol];
      const price = quote?.price ?? 0;
      const shares = Number(h.shares);
      const costBasis = Number(h.cost_basis);
      const value = price * shares;
      const gainLossPercent = costBasis > 0 ? ((price - costBasis) / costBasis) * 100 : 0;
      return { symbol: h.symbol, value, percentChange: quote?.percentChange ?? null, gainLossPercent };
    });
  }, [holdings, quotes]);

  const totalValue = holdingsWithValue.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + Number(h.cost_basis) * Number(h.shares), 0);

  const topHoldings = useMemo(() => {
    const rows = [...holdingsWithValue];
    if (sortDir === "best") rows.sort((a, b) => b.gainLossPercent - a.gainLossPercent);
    else if (sortDir === "worst") rows.sort((a, b) => a.gainLossPercent - b.gainLossPercent);
    else rows.sort((a, b) => b.value - a.value);
    return rows.slice(0, 6);
  }, [holdingsWithValue, sortDir]);

  const chartData: StatisticsChartPoint[] = history.map((row) => ({
    date: new Date(row.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: Number(row.total_value),
  }));

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No holdings yet. Add stocks from My Stock or Portfolio to see your overview.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <StockCardRow holdings={topHoldings} isLoading={isLoading} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PortfolioValueCard
          totalValue={totalValue}
          totalCost={totalCost}
          onSortWorst={() => setSortDir("worst")}
          onSortBest={() => setSortDir("best")}
        />
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-normal text-muted-foreground">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <StatisticsChart
              data={chartData}
              valueLabel="Portfolio value"
              emptyMessage="Check back tomorrow to see your portfolio value trend."
            />
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">My Stock</h2>
        <HoldingsTable holdings={holdings} />
      </div>
    </div>
  );
}
