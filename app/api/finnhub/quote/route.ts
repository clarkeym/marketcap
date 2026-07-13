import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getQuotes } from "@/lib/finnhub/cache";
import { parseSymbolsParam } from "@/lib/finnhub/validate";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbolsParam = request.nextUrl.searchParams.get("symbols");
  if (!symbolsParam) {
    return NextResponse.json({ error: "Missing symbols param" }, { status: 400 });
  }

  const symbols = parseSymbolsParam(symbolsParam);
  if (symbols.length === 0) {
    return NextResponse.json({ quotes: {} });
  }

  const quotes = await getQuotes(symbols);
  return NextResponse.json({ quotes });
}
