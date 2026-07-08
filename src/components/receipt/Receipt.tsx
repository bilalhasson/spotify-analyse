import type { ReactNode } from "react";

/** The paper surface: scalloped tear edges, halftone texture, drop shadow. */
export function Receipt({ children }: { children: ReactNode }) {
  return (
    <div className="receipt-paper relative w-[340px] max-w-full px-6 py-7 font-mono text-[12.5px] leading-[1.55] text-paper-ink">
      {children}
    </div>
  );
}
