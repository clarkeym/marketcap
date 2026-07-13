"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useStockSearch } from "@/hooks/use-stock-search";

export function StockSearchCombobox() {
  const [query, setQuery] = useState("");
  const { data: results, isFetching } = useStockSearch(query);
  const showResults = query.trim().length > 0;

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g. AAPL, Tesla)"
          className="pl-8"
        />
      </div>

      {showResults && (
        <div className="absolute z-10 mt-1 max-h-80 w-full overflow-y-auto rounded-lg border bg-popover shadow-md">
          {isFetching && <div className="p-3 text-sm text-muted-foreground">Searching...</div>}
          {!isFetching && results?.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No matches.</div>
          )}
          {!isFetching &&
            results?.map((r) => (
              <Link
                key={r.symbol}
                href={`/my-stock/${r.symbol}`}
                onClick={() => setQuery("")}
                className="flex items-center justify-between gap-2 border-b px-3 py-2 text-sm last:border-b-0 hover:bg-accent"
              >
                <span className="font-medium">{r.displaySymbol}</span>
                <span className="truncate text-muted-foreground">{r.description}</span>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
