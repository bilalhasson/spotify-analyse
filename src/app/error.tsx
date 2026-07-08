"use client";

import { Barcode, Receipt } from "@/components/receipt";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-5">
        <Receipt>
          <p className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-accent">
            Transaction failed
          </p>
          <h1 className="mt-1 text-center font-sans text-[24px] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
            Receipt jam
          </h1>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <p className="text-paper-muted">
            Something went wrong printing your stats. This is often an expired
            Spotify session — try again, or log back in.
          </p>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <button
            type="button"
            onClick={reset}
            className="action block w-full rounded-md border-2 border-accent py-2.5 text-center font-extrabold uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-paper"
          >
            Try again
          </button>
          <Barcode />
        </Receipt>
        <a href="/api/auth/login" className="action font-mono text-xs text-foreground/50 hover:text-accent">
          log in with Spotify again →
        </a>
      </div>
    </main>
  );
}
