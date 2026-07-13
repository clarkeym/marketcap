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
          <Button type="button" variant="outline" size="sm" onClick={onSortWorst}>
            Worst Performance
          </Button>
          <Button type="button" size="sm" onClick={onSortBest}>
            Top Performance
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
