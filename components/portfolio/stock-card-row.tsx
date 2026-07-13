"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PriceBadge } from "@/components/stock/price-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useStockProfile } from "@/hooks/use-stock-profile";
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
        <StockSummaryCard key={holding.symbol} holding={holding} isLoading={isLoading} />
      ))}
    </div>
  );
}

function StockSummaryCard({ holding, isLoading }: { holding: HoldingSummary; isLoading: boolean }) {
  const { data: profile } = useStockProfile(holding.symbol);

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9">
            {profile?.logoUrl && <AvatarImage src={profile.logoUrl} alt={profile.companyName ?? holding.symbol} />}
            <AvatarFallback className="text-xs font-medium">{holding.symbol.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{holding.symbol}</p>
            <p className="truncate text-xs text-muted-foreground">{profile?.companyName || " "}</p>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          <span className="text-xl font-semibold tabular-nums">{formatCurrency(holding.value)}</span>
        )}
        <PriceBadge value={holding.percentChange} />
      </CardContent>
    </Card>
  );
}
