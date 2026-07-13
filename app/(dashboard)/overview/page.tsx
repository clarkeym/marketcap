import { createClient } from "@/lib/supabase/server";
import { recordPortfolioSnapshot } from "@/lib/portfolio/snapshot";
import { OverviewDashboard } from "@/components/portfolio/overview-dashboard";
import { NewsList } from "@/components/news/news-list";

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: holdings } = await supabase
    .from("holdings")
    .select("id, symbol, shares, cost_basis, purchase_date")
    .eq("user_id", user!.id);

  await recordPortfolioSnapshot(user!.id, holdings ?? []);

  const { data: history } = await supabase
    .from("portfolio_value_history")
    .select("date, total_value")
    .eq("user_id", user!.id)
    .order("date", { ascending: true })
    .limit(90);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Overview</h1>
        <p className="text-muted-foreground">Your portfolio at a glance.</p>
      </div>
      <OverviewDashboard holdings={holdings ?? []} history={history ?? []} />

      <div>
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">Market News</h2>
        <NewsList emptyMessage="No market news available right now." />
      </div>
    </div>
  );
}
