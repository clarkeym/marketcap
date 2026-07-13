"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, ArrowUpDown, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PriceBadge } from "@/components/stock/price-badge";
import { StockAvatar } from "@/components/stock/stock-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuotes } from "@/hooks/use-quotes";
import { useStockProfile } from "@/hooks/use-stock-profile";
import { deleteHolding } from "@/app/actions/holdings";

export type Holding = {
  id: string;
  symbol: string;
  shares: string;
  cost_basis: string;
  purchase_date: string;
};

type SortKey = "symbol" | "purchase_date" | "shares" | "percentChange" | "price";

function SortButton({
  column,
  label,
  sortKey,
  sortDir,
  onSort,
}: {
  column: SortKey;
  label: string;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onSort: (column: SortKey) => void;
}) {
  const isActive = sortKey === column;
  const Icon = !isActive ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-foreground"
    >
      {label}
      <Icon className="size-3.5" />
    </button>
  );
}

function HoldingNameCell({ symbol }: { symbol: string }) {
  const { data: profile } = useStockProfile(symbol);

  return (
    <div className="flex items-center gap-2.5">
      <StockAvatar symbol={symbol} className="size-8" />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{symbol}</p>
        <p className="truncate text-xs font-normal text-muted-foreground">{profile?.companyName || " "}</p>
      </div>
    </div>
  );
}

export function HoldingsTable({ holdings }: { holdings: Holding[] }) {
  const symbols = holdings.map((h) => h.symbol);
  const { data: quotes, isLoading, isError } = useQuotes(symbols);
  const [sortKey, setSortKey] = useState<SortKey>("symbol");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sorted = useMemo(() => {
    const rows = [...holdings];
    rows.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      switch (sortKey) {
        case "shares":
          aVal = Number(a.shares);
          bVal = Number(b.shares);
          break;
        case "purchase_date":
          aVal = a.purchase_date;
          bVal = b.purchase_date;
          break;
        case "percentChange":
          aVal = quotes?.[a.symbol]?.percentChange ?? 0;
          bVal = quotes?.[b.symbol]?.percentChange ?? 0;
          break;
        case "price":
          aVal = quotes?.[a.symbol]?.price ?? 0;
          bVal = quotes?.[b.symbol]?.price ?? 0;
          break;
        default:
          aVal = a.symbol;
          bVal = b.symbol;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return rows;
  }, [holdings, quotes, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      try {
        await deleteHolding(id);
        toast.success("Holding removed");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to remove holding");
      } finally {
        setDeletingId(null);
      }
    });
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No holdings yet. Add your first stock to start tracking your portfolio.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            <SortButton column="symbol" label="Name Stock" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          </TableHead>
          <TableHead>
            <SortButton
              column="purchase_date"
              label="Invest Date"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
          </TableHead>
          <TableHead>
            <SortButton column="shares" label="Volume" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          </TableHead>
          <TableHead>
            <SortButton
              column="percentChange"
              label="Change"
              sortKey={sortKey}
              sortDir={sortDir}
              onSort={toggleSort}
            />
          </TableHead>
          <TableHead>
            <SortButton column="price" label="Price/stock" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
          </TableHead>
          <TableHead className="w-10" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((holding) => {
          const quote = quotes?.[holding.symbol];
          return (
            <TableRow key={holding.id}>
              <TableCell className="font-medium">
                <HoldingNameCell symbol={holding.symbol} />
              </TableCell>
              <TableCell>
                {new Date(holding.purchase_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </TableCell>
              <TableCell>{Number(holding.shares).toLocaleString()}</TableCell>
              <TableCell>
                {isError ? (
                  <span className="text-sm text-muted-foreground">—</span>
                ) : isLoading || !quote ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  <PriceBadge value={quote.percentChange} />
                )}
              </TableCell>
              <TableCell className="tabular-nums">
                {isError ? (
                  <span className="text-sm text-muted-foreground">Unavailable</span>
                ) : isLoading || !quote ? (
                  <Skeleton className="h-5 w-16" />
                ) : (
                  `$${quote.price.toFixed(2)}`
                )}
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(holding.id)}
                  disabled={isPending && deletingId === holding.id}
                  aria-label={`Remove ${holding.symbol}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
