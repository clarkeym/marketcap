"use client";

import { Plus } from "lucide-react";
import { useStockProfile } from "@/hooks/use-stock-profile";
import { useStockCandles } from "@/hooks/use-stock-candles";
import { useQuotes } from "@/hooks/use-quotes";
import { StatisticsChart } from "@/components/stock/statistics-chart";
import { PriceBadge } from "@/components/stock/price-badge";
import { WatchlistButton } from "@/components/stock/watchlist-button";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { NewsList } from "@/components/news/news-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export function StockDetail({ symbol }: { symbol: string }) {
  const { data: profile, isLoading: profileLoading } = useStockProfile(symbol);
  const { data: candles, isLoading: candlesLoading } = useStockCandles(symbol);
  const { data: quotes, isLoading: quoteLoading } = useQuotes([symbol]);
  const quote = quotes?.[symbol];
  const chartData = (candles ?? []).map((point) => ({
    date: new Date(point.time * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: point.close,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="size-12">
            {profile?.logoUrl && <AvatarImage src={profile.logoUrl} alt={profile.companyName ?? symbol} />}
            <AvatarFallback className="text-base">{symbol.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{symbol}</h1>
            {profileLoading ? (
              <Skeleton className="mt-1 h-4 w-32" />
            ) : (
              <p className="text-muted-foreground">{profile?.companyName || "Unknown company"}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <WatchlistButton symbol={symbol} />
          <AddHoldingDialog
            defaultSymbol={symbol}
            trigger={
              <Button type="button" variant="outline">
                <Plus className="size-4" />
                Save to Portfolio
              </Button>
            }
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3 font-normal">
            {quoteLoading || !quote ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <span className="text-3xl font-semibold tabular-nums">${quote.price.toFixed(2)}</span>
                <PriceBadge value={quote.percentChange} />
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candlesLoading ? (
            <Skeleton className="h-[280px] w-full" />
          ) : (
            <StatisticsChart data={chartData} />
          )}
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">News</h2>
        <NewsList symbol={symbol} emptyMessage="No recent news for this stock." />
      </div>
    </div>
  );
}
