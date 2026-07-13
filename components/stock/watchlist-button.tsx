"use client";

import { useTransition } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/use-watchlist";
import { addToWatchlist, removeFromWatchlist } from "@/app/actions/watchlist";
import { cn } from "@/lib/utils";

export function WatchlistButton({ symbol }: { symbol: string }) {
  const upperSymbol = symbol.toUpperCase();
  const { data: watchlist } = useWatchlist();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const isWatched = watchlist?.includes(upperSymbol) ?? false;

  function toggle() {
    startTransition(async () => {
      try {
        if (isWatched) {
          await removeFromWatchlist(upperSymbol);
          toast.success(`Removed ${upperSymbol} from watchlist`);
        } else {
          await addToWatchlist(upperSymbol);
          toast.success(`Added ${upperSymbol} to watchlist`);
        }
        queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong");
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={toggle}
      disabled={isPending}
      aria-pressed={isWatched}
      aria-label={isWatched ? `Remove ${upperSymbol} from watchlist` : `Add ${upperSymbol} to watchlist`}
    >
      <Star className={cn("size-4", isWatched && "fill-current text-amber-500")} />
    </Button>
  );
}
