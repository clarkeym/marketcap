"use client";

import { useNews } from "@/hooks/use-news";
import { NewsCard } from "@/components/news/news-card";
import { Skeleton } from "@/components/ui/skeleton";

export function NewsList({
  symbol,
  emptyMessage = "No news available.",
}: {
  symbol?: string;
  emptyMessage?: string;
}) {
  const { data: news, isLoading } = useNews(symbol);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {news.map((item) => (
        <NewsCard key={item.id} item={item} />
      ))}
    </div>
  );
}
