export type AllocationRow = { label: string; value: number };

export function AllocationBarList({ rows }: { rows: AllocationRow[] }) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (total === 0) {
    return <p className="text-sm text-muted-foreground">No holdings yet.</p>;
  }

  const sorted = [...rows].sort((a, b) => b.value - a.value);

  return (
    <div className="flex flex-col gap-3">
      {sorted.map((row) => {
        const pct = (row.value / total) * 100;
        return (
          <div key={row.label} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{row.label}</span>
              <span className="text-muted-foreground">{pct.toFixed(1)}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
