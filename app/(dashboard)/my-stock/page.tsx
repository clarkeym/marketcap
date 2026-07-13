"use client";

import Link from "next/link";
import { StockSearchCombobox } from "@/components/stock/stock-search-combobox";
import { PriceBadge } from "@/components/stock/price-badge";
import { WatchlistSection } from "@/components/stock/watchlist-section";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotes } from "@/hooks/use-quotes";

const POPULAR_SYMBOLS = ["AAPL", "GOOGL", "MSFT", "TSLA", "AMZN", "NVDA"];

export default function MyStockPage() {
  const { data: quotes, isLoading } = useQuotes(POPULAR_SYMBOLS);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">My Stock</h1>
        <p className="text-muted-foreground">Search stocks and track live quotes.</p>
      </div>

      <StockSearchCombobox />

      <WatchlistSection />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Popular stocks</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {POPULAR_SYMBOLS.map((symbol) => {
            const quote = quotes?.[symbol];
            return (
              <Link
                key={symbol}
                href={`/my-stock/${symbol}`}
                className="flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:bg-accent"
              >
                <span className="font-medium">{symbol}</span>
                {isLoading || !quote ? (
                  <Skeleton className="h-5 w-20" />
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="tabular-nums">${quote.price.toFixed(2)}</span>
                    <PriceBadge value={quote.percentChange} />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
