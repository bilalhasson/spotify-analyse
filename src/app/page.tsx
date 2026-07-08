import Link from "next/link";
import { Barcode, Receipt } from "@/components/receipt";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <Receipt>
        <p className="text-center text-[10.5px] font-extrabold uppercase tracking-[0.22em] text-accent">
          Now serving
        </p>
        <h1 className="mt-1 text-center font-sans text-[26px] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
          Your Spotify, printed
        </h1>
        <hr className="my-4 border-0 border-t border-dashed border-paper-line" />
        <p className="text-paper-muted">
          A receipt of what you&apos;ve been listening to — top artists, tracks,
          genres, and the decades they came from.
        </p>
        <hr className="my-4 border-0 border-t border-dashed border-paper-line" />
        <a
          href="/api/auth/login"
          className="block rounded-md border-2 border-accent py-2.5 text-center font-extrabold uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent hover:text-paper"
        >
          Log in with Spotify
        </a>
        <Link
          href="/demo"
          className="action mt-2 block text-center font-mono text-xs text-paper-muted hover:text-accent"
        >
          or see a sample (no login) →
        </Link>
        <Barcode />
      </Receipt>
    </main>
  );
}
