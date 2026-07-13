import { createClient } from "@/lib/supabase/server";
import { AllocationCard } from "@/components/portfolio/allocation-card";
import { GainLossSummaryCard } from "@/components/portfolio/gain-loss-summary-card";
import { SectorBreakdownCard } from "@/components/portfolio/sector-breakdown-card";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: holdings } = await supabase
    .from("holdings")
    .select("id, symbol, shares, cost_basis, purchase_date")
    .eq("user_id", user!.id);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground">Allocation, gain/loss, and sector breakdown.</p>
      </div>

      {!holdings || holdings.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No holdings yet. Add stocks to see your analytics.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <GainLossSummaryCard holdings={holdings} />
          <AllocationCard holdings={holdings} />
          <SectorBreakdownCard holdings={holdings} />
        </div>
      )}
    </div>
  );
}
