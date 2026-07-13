import { cn } from "@/lib/utils";

export function PriceBadge({
  value,
  className,
}: {
  value: number | null | undefined;
  className?: string;
}) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return <span className={cn("text-sm text-muted-foreground", className)}>—</span>;
  }

  const isPositive = value >= 0;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
        isPositive
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
        className,
      )}
    >
      {isPositive ? "↑" : "↓"} {Math.abs(value).toFixed(2)}%
    </span>
  );
}
