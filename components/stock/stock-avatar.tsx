"use client";

import { useStockProfile } from "@/hooks/use-stock-profile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export function StockAvatar({ symbol, className }: { symbol: string; className?: string }) {
  const { data: profile } = useStockProfile(symbol);

  return (
    <Avatar className={cn("size-9", className)}>
      {profile?.logoUrl && <AvatarImage src={profile.logoUrl} alt={profile.companyName ?? symbol} />}
      <AvatarFallback className="text-xs font-medium">{symbol.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}
