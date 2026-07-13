import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceBadge } from "@/components/stock/price-badge";
import { formatCurrency } from "@/lib/format";

export function PortfolioValueCard({
  totalValue,
  totalCost,
  onSortWorst,
  onSortBest,
}: {
  totalValue: number;
  totalCost: number;
  onSortWorst: () => void;
  onSortBest: () => void;
}) {
  const profit = totalValue - totalCost;
  const percentChange = totalCost > 0 ? (profit / totalCost) * 100 : 0;
  const isPositive = profit >= 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-normal text-muted-foreground">Portfolio Values</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold tabular-nums">{formatCurrency(totalValue)}</span>
          <PriceBadge value={percentChange} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isPositive ? "You're up " : "You're down "}
          <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
            {formatCurrency(Math.abs(profit))}
          </span>{" "}
          overall.
        </p>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={onSortWorst}>
            Worst Performance
          </Button>
          <Button type="button" size="sm" className="rounded-full" onClick={onSortBest}>
            Top Performance
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-accent px-4 py-3 text-sm text-accent-foreground">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Sparkles className="size-3.5" />
          </span>
          <span>Here&apos;s to improving your portfolio and understanding how investing works.</span>
        </div>
      </CardContent>
    </Card>
  );
}
