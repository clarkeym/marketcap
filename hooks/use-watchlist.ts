"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";

export function useWatchlist() {
  return useQuery({
    queryKey: ["watchlist"],
    queryFn: async (): Promise<string[]> => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("watchlist_items")
        .select("symbol")
        .order("added_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data.map((row) => row.symbol);
    },
  });
}
