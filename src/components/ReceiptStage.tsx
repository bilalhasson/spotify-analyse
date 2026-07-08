"use client";

import { useState } from "react";
import Link from "next/link";
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
  shareTokens,
  demo = false,
}: {
  initialRange: TimeRange;
  models: Record<TimeRange, ReceiptModel>;
  shareTokens: Record<TimeRange, string>;
  // In demo mode the nav drops session-only actions (refresh/logout) and points
  // at public routes, so the whole thing works with no login.
  demo?: boolean;
}) {
  const [range, setRange] = useState<TimeRange>(initialRange);
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);
  const basePath = demo ? "/demo" : "/dashboard";

  function select(next: TimeRange) {
    setRange(next);
    setTick((t) => t + 1); // force a remount so re-selecting the same range replays
    setCopied(false);
    window.history.replaceState(null, "", `${basePath}?range=${next}`);
  }

  async function share() {
    const url = `${window.location.origin}/s?t=${shareTokens[range]}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt("Copy your share link:", url);
    }
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

      <nav className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-foreground/50">
        <button type="button" onClick={share} className="action font-bold text-accent hover:opacity-70">
          {copied ? "link copied!" : "share"}
        </button>
        <a
          className="action hover:text-accent"
          href={demo ? `/api/share-image?t=${shareTokens[range]}` : `/api/receipt-image?range=${range}`}
          download={`receipt-${range}.png`}
        >
          download
        </a>
        {demo ? (
          <>
            <Link className="action hover:text-accent" href="/demo/playlists">
              playlists
            </Link>
            <Link className="action hover:text-accent" href="/">
              make your own
            </Link>
          </>
        ) : (
          <>
            <Link className="action hover:text-accent" href="/playlists">
              playlists
            </Link>
            <a className="action hover:text-accent" href={`/api/stats/refresh?range=${range}`}>
              refresh
            </a>
            <a className="action hover:text-accent" href="/api/auth/logout">
              log out
            </a>
          </>
        )}
      </nav>
    </div>
  );
}
