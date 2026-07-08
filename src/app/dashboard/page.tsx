import { redirect } from "next/navigation";
import { getSession, needsRefresh } from "@/lib/session";
import { spotifyGet } from "@/lib/spotify";
import { createSpotifyDataSource, isTimeRange, type TimeRange } from "@/lib/musicData";
import { buildReceiptModel, type ReceiptModel } from "@/lib/receipt";
import { ReceiptStage } from "@/components/ReceiptStage";

const RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getSession();
  if (!session.accessToken) redirect("/api/auth/login");
  if (needsRefresh(session)) redirect("/api/auth/refresh?returnTo=/dashboard");

  const sp = await searchParams;
  const initialRange: TimeRange = isTimeRange(sp.range) ? sp.range : "medium_term";
  const displayName = session.displayName ?? "you";
  const userId =
    session.userId ??
    (await spotifyGet<{ id: string }>("/me", session.accessToken)).data?.id ??
    "anon";

  // Prefetch every range so the client toggle is instant (all reads are cached).
  // Recently-played is range-independent, so fetch it once.
  const source = createSpotifyDataSource(userId, session.accessToken);
  const recent = await source.getRecentlyPlayed(8);
  const entries = await Promise.all(
    RANGES.map(async (range) => {
      const [artists, tracks] = await Promise.all([
        source.getTopArtists(range, 10),
        source.getTopTracks(range, 20),
      ]);
      return [
        range,
        buildReceiptModel({ displayName, range, artists, tracks, recent }),
      ] as const;
    }),
  );
  const models = Object.fromEntries(entries) as Record<TimeRange, ReceiptModel>;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <ReceiptStage initialRange={initialRange} models={models} />
    </main>
  );
}
