import Link from "next/link";
import { Barcode, Receipt } from "@/components/receipt";

export default function NotFound() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex flex-col items-center gap-5">
        <Receipt>
          <div className="relative">
            <span className="absolute right-0 top-0 rotate-[9deg] rounded-md border-[2.5px] border-accent px-2 py-1 text-[11px] font-extrabold uppercase tracking-[0.12em] text-accent">
              Void
            </span>
            <p className="text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-accent">
              404
            </p>
          </div>
          <h1 className="mt-1 font-sans text-[24px] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
            No such receipt
          </h1>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <p className="text-paper-muted">
            This page didn&apos;t print. Check the link, or head back to the
            counter.
          </p>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <Link
            href="/"
            className="action block rounded-md border-2 border-accent py-2.5 text-center font-extrabold uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-paper"
          >
            Back to start
          </Link>
          <Barcode />
        </Receipt>
      </div>
    </main>
  );
}
