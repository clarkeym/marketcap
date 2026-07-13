import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { fetchFinnhub } from "@/lib/finnhub/client";
import type { FinnhubNewsItem, NewsItem } from "@/lib/finnhub/types";

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");

  try {
    let items: FinnhubNewsItem[];

    if (symbol) {
      const to = new Date();
      const from = new Date(to);
      from.setDate(from.getDate() - 14);
      items = await fetchFinnhub<FinnhubNewsItem[]>("/company-news", {
        symbol,
        from: toDateString(from),
        to: toDateString(to),
      });
    } else {
      items = await fetchFinnhub<FinnhubNewsItem[]>("/news", { category: "general" });
    }

    const news: NewsItem[] = items.slice(0, 20).map((item) => ({
      id: item.id,
      headline: item.headline,
      summary: item.summary,
      source: item.source,
      url: item.url,
      imageUrl: item.image || null,
      publishedAt: new Date(item.datetime * 1000).toISOString(),
    }));

    return NextResponse.json({ news });
  } catch {
    return NextResponse.json({ news: [] });
  }
}
