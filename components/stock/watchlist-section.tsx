"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useWatchlist } from "@/hooks/use-watchlist";
import { useQuotes } from "@/hooks/use-quotes";
import { PriceBadge } from "@/components/stock/price-badge";
import { StockAvatar } from "@/components/stock/stock-avatar";
import { WatchlistButton } from "@/components/stock/watchlist-button";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function WatchlistSection() {
  const { data: watchlist, isLoading: watchlistLoading } = useWatchlist();
  const { data: quotes, isLoading: quotesLoading } = useQuotes(watchlist ?? []);

  if (watchlistLoading) {
    return (
      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Watchlist</h2>
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (!watchlist || watchlist.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-medium text-muted-foreground">Watchlist</h2>
      <div className="flex flex-col gap-2">
        {watchlist.map((symbol) => {
          const quote = quotes?.[symbol];
          return (
            <div key={symbol} className="flex items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3">
              <Link href={`/my-stock/${symbol}`} className="flex flex-1 items-center gap-2.5 text-sm font-medium hover:underline">
                <StockAvatar symbol={symbol} className="size-8" />
                {symbol}
              </Link>
              {quotesLoading || !quote ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <div className="flex items-center gap-3 text-sm">
                  <span className="tabular-nums">${quote.price.toFixed(2)}</span>
                  <PriceBadge value={quote.percentChange} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <AddHoldingDialog
                  defaultSymbol={symbol}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      <Plus className="size-3.5" />
                      Save
                    </Button>
                  }
                />
                <WatchlistButton symbol={symbol} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
