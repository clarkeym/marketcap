import { Card, CardContent } from "@/components/ui/card";
import { PriceBadge } from "@/components/stock/price-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/format";

export type HoldingSummary = {
  symbol: string;
  value: number;
  percentChange: number | null;
};

export function StockCardRow({
  holdings,
  isLoading,
}: {
  holdings: HoldingSummary[];
  isLoading: boolean;
}) {
  if (holdings.length === 0) return null;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {holdings.map((holding) => (
        <Card key={holding.symbol}>
          <CardContent className="flex flex-col gap-2">
            <span className="text-sm font-medium text-muted-foreground">{holding.symbol}</span>
            {isLoading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <span className="text-xl font-semibold tabular-nums">{formatCurrency(holding.value)}</span>
            )}
            <PriceBadge value={holding.percentChange} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
