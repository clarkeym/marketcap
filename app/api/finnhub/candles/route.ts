import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getCandles } from "@/lib/finnhub/cache";
import { isValidSymbol } from "@/lib/finnhub/validate";

const VALID_RESOLUTIONS = new Set(["1", "5", "15", "30", "60", "D", "W", "M"]);

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const resolution = params.get("resolution") ?? "D";
  const from = Number(params.get("from"));
  const to = Number(params.get("to"));

  if (
    !symbol ||
    !isValidSymbol(symbol) ||
    !VALID_RESOLUTIONS.has(resolution) ||
    !Number.isFinite(from) ||
    !Number.isFinite(to) ||
    from >= to
  ) {
    return NextResponse.json({ error: "Missing or invalid params" }, { status: 400 });
  }

  const candles = await getCandles(symbol, resolution, from, to);
  return NextResponse.json({ candles });
}
