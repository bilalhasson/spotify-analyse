"use client";

import { useState } from "react";
import type { TimeRange } from "@/lib/musicData";
import type { ReceiptModel } from "@/lib/receipt";
import { ReceiptCard } from "@/components/receipt";
import { TimeRangeToggle } from "@/components/TimeRangeToggle";

/**
 * Interactive dashboard chrome. Holds the selected range in client state and
 * swaps the receipt in place — remounting via `key` re-triggers the CSS
 * line-reveal. All three ranges are prefetched on the server, so switching is
 * instant. The URL's `?range=` is kept in sync for deep links.
 */
export function ReceiptStage({
  initialRange,
  models,
}: {
  initialRange: TimeRange;
  models: Record<TimeRange, ReceiptModel>;
}) {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [tick, setTick] = useState(0);

  function select(next: TimeRange) {
    setRange(next);
    setTick((t) => t + 1); // force a remount so re-selecting the same range replays
    window.history.replaceState(null, "", `/dashboard?range=${next}`);
  }

  const model = models[range];

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5">
      <TimeRangeToggle active={range} onSelect={select} />

      <div className="receipt-print" key={`${range}-${tick}`}>
        <ReceiptCard model={model} />
      </div>

      <p aria-live="polite" className="sr-only">
        Showing {model.rangeLabel}
      </p>

      <nav className="flex gap-4 font-mono text-xs text-foreground/50">
        <a className="transition-colors hover:text-accent" href={`/api/stats/refresh?range=${range}`}>
          refresh
        </a>
        <a className="transition-colors hover:text-accent" href="/api/probe">
          probe
        </a>
        <a className="transition-colors hover:text-accent" href="/api/auth/logout">
          log out
        </a>
      </nav>
    </div>
  );
}
