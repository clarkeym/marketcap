import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getQuotes } from "@/lib/finnhub/cache";

export async function recordPortfolioSnapshot(
  userId: string,
  holdings: { symbol: string; shares: string }[],
) {
  if (holdings.length === 0) return;

  const symbols = Array.from(new Set(holdings.map((h) => h.symbol)));
  const quotes = await getQuotes(symbols);

  const totalValue = holdings.reduce((sum, holding) => {
    const price = quotes[holding.symbol]?.price ?? 0;
    return sum + price * Number(holding.shares);
  }, 0);

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  await supabase
    .from("portfolio_value_history")
    .upsert({ user_id: userId, date: today, total_value: totalValue }, { onConflict: "user_id,date" });
}
