import { redirect } from "next/navigation";
import { getSession, needsRefresh } from "@/lib/session";
import { spotifyGet } from "@/lib/spotify";

interface Artist {
  id: string;
  name: string;
  genres: string[];
}
interface TopArtists {
  items: Artist[];
}

export default async function Dashboard() {
  const session = await getSession();

  if (!session.accessToken) redirect("/api/auth/login");
  // Refresh (in a route handler) if the token is expired or within 30s of it.
  if (needsRefresh(session)) {
    redirect("/api/auth/refresh?returnTo=/dashboard");
  }

  const { status, data } = await spotifyGet<TopArtists>(
    "/me/top/artists?limit=5&time_range=medium_term",
    session.accessToken,
  );

  return (
    <main className="flex flex-1 items-center justify-center p-6 font-mono">
      <div className="w-full max-w-sm border border-dashed border-current/40 bg-white/5 p-6 text-sm">
        <p className="text-center tracking-widest">*** TOP 5 ARTISTS ***</p>
        <p className="mt-1 text-center text-xs opacity-60">last 6 months</p>
        <hr className="my-4 border-dashed border-current/30" />
        {status === 200 && data ? (
          <ol className="space-y-1">
            {data.items.map((artist, i) => (
              <li key={artist.id} className="flex justify-between gap-4">
                <span>
                  {String(i + 1).padStart(2, "0")} {artist.name}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-center text-xs">
            Could not load artists (HTTP {status}).
          </p>
        )}
        <hr className="my-4 border-dashed border-current/30" />
        <div className="flex justify-between text-xs opacity-70">
          <a href="/api/probe">endpoint probe</a>
          <a href="/api/auth/logout">log out</a>
        </div>
      </div>
    </main>
  );
}
