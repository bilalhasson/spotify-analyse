import { redirect } from "next/navigation";
import { getSession, needsRefresh } from "@/lib/session";
import { spotifyGet } from "@/lib/spotify";
import {
  createSpotifyDataSource,
  decadeBreakdown,
  isTimeRange,
  TIME_RANGES,
  topGenres,
  type TimeRange,
} from "@/lib/musicData";

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getSession();
  if (!session.accessToken) redirect("/api/auth/login");
  if (needsRefresh(session)) redirect("/api/auth/refresh?returnTo=/dashboard");

  const sp = await searchParams;
  const range: TimeRange = isTimeRange(sp.range) ? sp.range : "medium_term";

  const userId =
    session.userId ??
    (await spotifyGet<{ id: string }>("/me", session.accessToken)).data?.id ??
    "anon";

  const source = createSpotifyDataSource(userId, session.accessToken);
  const [artists, tracks, recent] = await Promise.all([
    source.getTopArtists(range, 10),
    source.getTopTracks(range, 20),
    source.getRecentlyPlayed(8),
  ]);
  const topTracks = tracks.slice(0, 10);
  const genres = topGenres(artists);
  const decades = decadeBreakdown(tracks);
  const rangeLabel = TIME_RANGES.find((r) => r.value === range)?.label ?? "";

  return (
    <main className="flex flex-1 items-center justify-center p-6 font-mono">
      <div className="w-full max-w-md space-y-4 border border-dashed border-current/40 bg-white/5 p-6 text-sm">
        <header className="text-center">
          <p className="tracking-widest">*** SPOTIFY RECEIPT ***</p>
          {session.displayName ? (
            <p className="text-xs opacity-60">{session.displayName}</p>
          ) : null}
        </header>

        {/* time-range toggle */}
        <nav className="flex justify-center gap-2 text-xs">
          {TIME_RANGES.map((r) => (
            <a
              key={r.value}
              href={`/dashboard?range=${r.value}`}
              className={`border border-dashed px-2 py-1 ${
                r.value === range
                  ? "border-current bg-white/15"
                  : "border-current/30 opacity-60 hover:opacity-100"
              }`}
            >
              {r.label}
            </a>
          ))}
        </nav>

        <Section title={`TOP ARTISTS · ${rangeLabel}`}>
          {artists.map((a, i) => (
            <Row key={a.id} index={i + 1} left={a.name} />
          ))}
        </Section>

        <Section title={`TOP TRACKS · ${rangeLabel}`}>
          {topTracks.map((t, i) => (
            <Row key={t.id} index={i + 1} left={t.name} right={t.artists[0]} />
          ))}
        </Section>

        {genres.length > 0 && (
          <Section title="TOP GENRES">
            {genres.map((g) => (
              <div key={g.genre} className="flex justify-between gap-4">
                <span>{g.genre}</span>
                <span className="opacity-60">×{g.count}</span>
              </div>
            ))}
          </Section>
        )}

        {decades.length > 0 && (
          <Section title={`DECADES · ${rangeLabel}`}>
            {decades.map((d) => (
              <div key={d.decade} className="flex justify-between gap-4">
                <span>{d.decade}</span>
                <span className="opacity-60">×{d.count}</span>
              </div>
            ))}
          </Section>
        )}

        {recent.length > 0 && (
          <Section title="RECENTLY PLAYED">
            {recent.map((p) => (
              <div key={p.playedAt} className="flex justify-between gap-4">
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 opacity-60">{p.artist}</span>
              </div>
            ))}
          </Section>
        )}

        <hr className="border-dashed border-current/30" />
        <div className="flex justify-between text-xs opacity-70">
          <a href={`/api/stats/refresh?range=${range}`}>refresh</a>
          <a href="/api/probe">probe</a>
          <a href="/api/auth/logout">log out</a>
        </div>
      </div>
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <p className="tracking-widest opacity-70">{title}</p>
      <hr className="my-2 border-dashed border-current/30" />
      <div className="space-y-1">{children}</div>
    </section>
  );
}

function Row({
  index,
  left,
  right,
}: {
  index: number;
  left: string;
  right?: string;
}) {
  return (
    <div className="flex justify-between gap-4">
      <span className="truncate">
        {String(index).padStart(2, "0")} {left}
      </span>
      {right ? <span className="shrink-0 opacity-60">{right}</span> : null}
    </div>
  );
}
