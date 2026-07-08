/** A receipt-styled percentage bar (genre / decade composition). */
export function Meter({ label, pct }: { label: string; pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-20 shrink-0 truncate">{label}</span>
      <span className="h-[7px] flex-1 overflow-hidden rounded-full bg-paper-line">
        <span
          className="block h-full rounded-full bg-accent"
          style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        />
      </span>
      <span className="w-8 shrink-0 text-right tabular-nums text-paper-muted">{pct}%</span>
    </div>
  );
}
