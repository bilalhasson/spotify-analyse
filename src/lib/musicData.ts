import { unstable_cache } from "next/cache";
import { spotifyGet } from "@/lib/spotify";

// --- Domain types (source-agnostic) ---------------------------------------

export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: "short_term", label: "4 weeks" },
  { value: "medium_term", label: "6 months" },
  { value: "long_term", label: "all time" },
];

export function isTimeRange(v: string | undefined): v is TimeRange {
  return v === "short_term" || v === "medium_term" || v === "long_term";
}

export interface Artist {
  id: string;
  name: string;
  genres: string[];
}
export interface Track {
  id: string;
  name: string;
  artists: string[];
}

export interface MusicDataSource {
  getTopArtists(range: TimeRange, limit?: number): Promise<Artist[]>;
  getTopTracks(range: TimeRange, limit?: number): Promise<Track[]>;
}

/** Cache tag for a user's stats — invalidate with revalidateTag() on refresh. */
export function statsTag(userId: string): string {
  return `stats:${userId}`;
}

// --- Spotify implementation -----------------------------------------------

interface SpotifyArtist {
  id: string;
  name: string;
  genres: string[];
}
interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
}
interface Paged<T> {
  items: T[];
}

const ONE_HOUR = 3600;

export function createSpotifyDataSource(
  userId: string,
  accessToken: string,
): MusicDataSource {
  // Cache keys include userId + range but NOT the token, so an hourly token
  // refresh doesn't bust the cache. The token is only used on a cache miss.
  return {
    getTopArtists: (range, limit = 10) =>
      unstable_cache(
        async () => {
          const { data } = await spotifyGet<Paged<SpotifyArtist>>(
            `/me/top/artists?limit=${limit}&time_range=${range}`,
            accessToken,
          );
          return (data?.items ?? []).map((a) => ({
            id: a.id,
            name: a.name,
            // Spotify can omit `genres` for some artists — default to [].
            genres: Array.isArray(a.genres) ? a.genres : [],
          }));
        },
        ["top-artists", userId, range, String(limit)],
        { revalidate: ONE_HOUR, tags: [statsTag(userId)] },
      )(),

    getTopTracks: (range, limit = 10) =>
      unstable_cache(
        async () => {
          const { data } = await spotifyGet<Paged<SpotifyTrack>>(
            `/me/top/tracks?limit=${limit}&time_range=${range}`,
            accessToken,
          );
          return (data?.items ?? []).map((t) => ({
            id: t.id,
            name: t.name,
            artists: t.artists.map((x) => x.name),
          }));
        },
        ["top-tracks", userId, range, String(limit)],
        { revalidate: ONE_HOUR, tags: [statsTag(userId)] },
      )(),
  };
}

// --- Derived views --------------------------------------------------------

/** Roll up genres across the given artists, most common first. */
export function topGenres(
  artists: Artist[],
  n = 6,
): { genre: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([genre, count]) => ({ genre, count }));
}
