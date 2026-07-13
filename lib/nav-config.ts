import type { LucideIcon } from "lucide-react";
import { BarChart3, LayoutDashboard, Newspaper, Users, UserRound, Wallet } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/my-stock", label: "My Stock", icon: Newspaper },
  { href: "/portfolio", label: "Portfolio", icon: Wallet },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/community", label: "Community", icon: Users },
  { href: "/account", label: "Account", icon: UserRound },
];
