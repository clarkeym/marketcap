"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LineChart, LogOut, Menu } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav-config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <LineChart className="size-4" />
        </div>
        <span className="font-semibold">MarketCap</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" size="icon" />}>
          <Menu className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <DropdownMenuItem
                key={item.href}
                render={<Link href={item.href} />}
                className={cn("flex items-center gap-2", isActive && "bg-accent text-accent-foreground")}
              >
                <Icon className="size-4" />
                {item.label}
              </DropdownMenuItem>
            );
          })}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => logout()}
          >
            <LogOut className="size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
