import Link from "next/link";
import { sampleLibrary } from "@/lib/sampleData";
import { LibraryReceipt } from "@/components/receipt";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata = {
  title: "Demo · Playlist library",
  description: "A sample playlist-library receipt with example data.",
};

// PUBLIC demo — no auth.
export default function DemoPlaylistsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
      <DemoBanner />
      <LibraryReceipt library={sampleLibrary()} />
      <nav className="flex gap-4 font-mono text-xs text-foreground/50">
        <Link className="action hover:text-accent" href="/demo">
          ← receipt
        </Link>
        <Link className="action hover:text-accent" href="/">
          make your own
        </Link>
      </nav>
    </main>
  );
}
