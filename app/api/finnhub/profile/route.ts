import { NextResponse, type NextRequest } from "next/server";
import { requireUser } from "@/lib/api-auth";
import { getProfile } from "@/lib/finnhub/cache";
import { isValidSymbol } from "@/lib/finnhub/validate";

export async function GET(request: NextRequest) {
  const user = await requireUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbol = request.nextUrl.searchParams.get("symbol");
  if (!symbol || !isValidSymbol(symbol)) {
    return NextResponse.json({ error: "Missing or invalid symbol param" }, { status: 400 });
  }

  const profile = await getProfile(symbol);
  return NextResponse.json({ profile });
}
