import type { ReactNode } from "react";

/** A labeled receipt section, preceded by a dashed tear line. */
export function Section({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <section>
      <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
      <p className="mb-1.5 text-[10.5px] uppercase tracking-[0.18em] text-accent">
        {label}
      </p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </section>
  );
}
