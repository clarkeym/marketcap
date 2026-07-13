import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddHoldingDialog } from "@/components/portfolio/add-holding-dialog";
import { HoldingsTable } from "@/components/portfolio/holdings-table";
import { Button } from "@/components/ui/button";

export default async function PortfolioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: holdings } = await supabase
    .from("holdings")
    .select("id, symbol, shares, cost_basis, purchase_date")
    .eq("user_id", user!.id)
    .order("purchase_date", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Portfolio</h1>
          <p className="text-muted-foreground">Your holdings and performance.</p>
        </div>
        <AddHoldingDialog
          trigger={
            <Button type="button">
              <Plus className="size-4" />
              Add Holding
            </Button>
          }
        />
      </div>

      <HoldingsTable holdings={holdings ?? []} />
    </div>
  );
}
