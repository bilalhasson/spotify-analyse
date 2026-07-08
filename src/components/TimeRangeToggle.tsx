"use client";

import { TIME_RANGES, type TimeRange } from "@/lib/musicData";

/**
 * 4wk / 6mo / all-time switch. Renders real `?range=` links (so it works
 * without JS), progressively enhanced to switch in place via `onSelect`.
 */
export function TimeRangeToggle({
  active,
  onSelect,
}: {
  active: TimeRange;
  onSelect: (range: TimeRange) => void;
}) {
  return (
    <nav className="flex justify-center gap-2 font-mono text-xs">
      {TIME_RANGES.map((r) => (
        <a
          key={r.value}
          href={`/dashboard?range=${r.value}`}
          aria-current={r.value === active ? "true" : undefined}
          onClick={(e) => {
            e.preventDefault();
            onSelect(r.value);
          }}
          className={`border border-dashed px-2 py-1 transition-colors ${
            r.value === active
              ? "border-accent text-accent"
              : "border-current/30 opacity-60 hover:opacity-100"
          }`}
        >
          {r.label}
        </a>
      ))}
    </nav>
  );
}
