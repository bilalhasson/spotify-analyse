import type { ReactNode } from "react";

/** Rotated rubber-stamp accent in the top-right corner. */
export function Stamp({ children }: { children: ReactNode }) {
  return (
    <span className="absolute right-4 top-5 rotate-[9deg] rounded-md border-[2.5px] border-accent px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent opacity-90">
      {children}
    </span>
  );
}
