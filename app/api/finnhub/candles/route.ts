import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getCandles } from "@/lib/finnhub/cache";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = request.nextUrl.searchParams;
  const symbol = params.get("symbol");
  const resolution = params.get("resolution") ?? "D";
  const from = params.get("from");
  const to = params.get("to");

  if (!symbol || !from || !to) {
    return NextResponse.json({ error: "Missing symbol/from/to params" }, { status: 400 });
  }

  const candles = await getCandles(symbol, resolution, Number(from), Number(to));
  return NextResponse.json({ candles });
}
