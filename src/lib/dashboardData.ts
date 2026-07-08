import { createSpotifyDataSource, type TimeRange } from "@/lib/musicData";
import { buildReceiptModel, type ReceiptModel } from "@/lib/receipt";
import { spotifyGet } from "@/lib/spotify";
import type { SessionData } from "@/lib/session";

// Shared by the dashboard (all ranges) and the image route (one range), so the
// fetch + model-building logic lives in exactly one place.

async function resolveUserId(session: SessionData): Promise<string> {
  if (session.userId) return session.userId;
  const me = await spotifyGet<{ id: string }>("/me", session.accessToken!);
  return me.data?.id ?? "anon";
}

export async function loadReceiptModel(
  session: SessionData,
  range: TimeRange,
): Promise<ReceiptModel> {
  const source = createSpotifyDataSource(await resolveUserId(session), session.accessToken!);
  const [artists, tracks, recent] = await Promise.all([
    source.getTopArtists(range, 10),
    source.getTopTracks(range, 20),
    source.getRecentlyPlayed(8),
  ]);
  return buildReceiptModel({
    displayName: session.displayName ?? "you",
    range,
    artists,
    tracks,
    recent,
  });
}

export async function loadReceiptModels(
  session: SessionData,
  ranges: readonly TimeRange[],
): Promise<Record<TimeRange, ReceiptModel>> {
  const source = createSpotifyDataSource(await resolveUserId(session), session.accessToken!);
  const recent = await source.getRecentlyPlayed(8); // range-independent
  const entries = await Promise.all(
    ranges.map(async (range) => {
      const [artists, tracks] = await Promise.all([
        source.getTopArtists(range, 10),
        source.getTopTracks(range, 20),
      ]);
      return [
        range,
        buildReceiptModel({
          displayName: session.displayName ?? "you",
          range,
          artists,
          tracks,
          recent,
        }),
      ] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<TimeRange, ReceiptModel>;
}
