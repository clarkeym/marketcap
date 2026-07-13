"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function addToWatchlist(symbol: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("watchlist_items")
    .upsert({ user_id: user.id, symbol: symbol.toUpperCase() }, { onConflict: "user_id,symbol" });

  if (error) throw new Error(error.message);

  revalidatePath("/my-stock");
}

export async function removeFromWatchlist(symbol: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("watchlist_items")
    .delete()
    .eq("user_id", user.id)
    .eq("symbol", symbol.toUpperCase());

  if (error) throw new Error(error.message);

  revalidatePath("/my-stock");
}
