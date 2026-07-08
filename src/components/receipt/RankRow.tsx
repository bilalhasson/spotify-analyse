/** A numbered ranking row: accent rank, name, optional right-aligned value. */
export function RankRow({
  rank,
  name,
  value,
  big = false,
}: {
  rank: string;
  name: string;
  value?: string;
  big?: boolean;
}) {
  return (
    <div className="flex justify-between gap-3">
      <span
        className={`min-w-0 truncate ${big ? "font-sans text-[15px] font-extrabold tracking-[-0.01em]" : ""}`}
      >
        <span className="mr-2 font-extrabold tabular-nums text-accent">{rank}</span>
        {name}
      </span>
      {value != null && (
        <span className="shrink-0 truncate tabular-nums text-paper-muted">
          {value}
        </span>
      )}
    </div>
  );
}
