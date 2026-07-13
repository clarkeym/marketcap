import type { NewsItem } from "@/lib/finnhub/types";
import { formatRelativeTime } from "@/lib/format";

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 rounded-lg border bg-card p-3 hover:bg-accent"
    >
      {item.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- external, unpredictable news-source domains
        <img src={item.imageUrl} alt="" className="size-16 shrink-0 rounded-md object-cover" />
      )}
      <div className="flex min-w-0 flex-col gap-1">
        <p className="line-clamp-2 text-sm font-medium">{item.headline}</p>
        <p className="text-xs text-muted-foreground">
          {item.source} · {formatRelativeTime(item.publishedAt)}
        </p>
      </div>
    </a>
  );
}
