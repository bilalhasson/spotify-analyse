import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, needsRefresh } from "@/lib/session";
import { loadPlaylistLibrary } from "@/lib/dashboardData";
import { LibraryReceipt } from "@/components/receipt";

export default async function PlaylistsPage() {
  const session = await getSession();
  if (!session.accessToken) redirect("/api/auth/login");
  if (needsRefresh(session)) redirect("/api/auth/refresh?returnTo=/playlists");

  const library = await loadPlaylistLibrary(session);

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="flex w-full max-w-md flex-col items-center gap-5">
        <LibraryReceipt library={library} />
        <nav className="flex gap-4 font-mono text-xs text-foreground/50">
          <Link className="action hover:text-accent" href="/dashboard">
            ← dashboard
          </Link>
          <a className="action hover:text-accent" href="/api/auth/logout">
            log out
          </a>
        </nav>
      </div>
    </main>
  );
}
