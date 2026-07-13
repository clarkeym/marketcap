import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { fetchFinnhub } from "@/lib/finnhub/client";
import type { FinnhubSearchResult } from "@/lib/finnhub/types";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await fetchFinnhub<FinnhubSearchResult>("/search", { q: query });
    const results = data.result
      .filter((r) => r.type === "Common Stock")
      .slice(0, 10)
      .map((r) => ({ symbol: r.symbol, displaySymbol: r.displaySymbol, description: r.description }));
    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
