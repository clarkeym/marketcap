"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addHoldingSchema, type AddHoldingInput } from "@/lib/validations/holding";

export async function addHolding(input: AddHoldingInput) {
  const validated = addHoldingSchema.parse(input);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: portfolio, error: portfolioError } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .single();

  if (portfolioError || !portfolio) {
    throw new Error("No portfolio found for this user");
  }

  const { error } = await supabase.from("holdings").insert({
    portfolio_id: portfolio.id,
    user_id: user.id,
    symbol: validated.symbol,
    shares: validated.shares,
    cost_basis: validated.costBasis,
    purchase_date: validated.purchaseDate,
    notes: validated.notes || null,
  });

  if (error) throw new Error(error.message);

  revalidatePath("/portfolio");
}

export async function deleteHolding(holdingId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("holdings")
    .delete()
    .eq("id", holdingId)
    .eq("user_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/portfolio");
}
