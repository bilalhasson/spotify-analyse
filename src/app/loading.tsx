import { Barcode, Receipt } from "@/components/receipt";

const bars = [70, 45, 90, 60, 80, 40, 65];

export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Receipt>
        <p className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-accent">
          Printing…
        </p>
        <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
        <div className="flex animate-pulse flex-col gap-2.5" aria-hidden="true">
          {bars.map((w, i) => (
            <span key={i} className="h-3 rounded-sm bg-paper-line" style={{ width: `${w}%` }} />
          ))}
        </div>
        <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
        <Barcode />
        <p className="sr-only">Loading your receipt…</p>
      </Receipt>
    </main>
  );
}
