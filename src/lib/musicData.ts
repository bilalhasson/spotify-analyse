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
  releaseYear?: number;
}
export interface Play {
  id: string;
  name: string;
  artist: string;
  playedAt: string;
}

export interface MusicDataSource {
  getTopArtists(range: TimeRange, limit?: number): Promise<Artist[]>;
  getTopTracks(range: TimeRange, limit?: number): Promise<Track[]>;
  getRecentlyPlayed(limit?: number): Promise<Play[]>;
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
  album?: { release_date?: string };
}
interface Paged<T> {
  items: T[];
}

const ONE_HOUR = 3600;
const FIVE_MIN = 300;

/** Parse a year from a Spotify release_date ("2015", "2015-06", "2015-06-01"). */
function parseYear(releaseDate?: string): number | undefined {
  if (!releaseDate) return undefined;
  const year = Number(releaseDate.slice(0, 4));
  return Number.isFinite(year) ? year : undefined;
}

function mapTrack(t: SpotifyTrack): Track {
  return {
    id: t.id,
    name: t.name,
    artists: (t.artists ?? []).map((x) => x.name),
    releaseYear: parseYear(t.album?.release_date),
  };
}

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
          return (data?.items ?? []).map(mapTrack);
        },
        ["top-tracks", userId, range, String(limit)],
        { revalidate: ONE_HOUR, tags: [statsTag(userId)] },
      )(),

    getRecentlyPlayed: (limit = 10) =>
      unstable_cache(
        async () => {
          const { data } = await spotifyGet<
            Paged<{ track: SpotifyTrack; played_at: string }>
          >(`/me/player/recently-played?limit=${limit}`, accessToken);
          return (data?.items ?? [])
            .filter((i) => i.track)
            .map((i) => ({
              id: i.track.id,
              name: i.track.name,
              artist: i.track.artists?.[0]?.name ?? "",
              playedAt: i.played_at,
            }));
        },
        // Recently-played changes often, so a shorter TTL than top stats.
        ["recently-played", userId, String(limit)],
        { revalidate: FIVE_MIN, tags: [statsTag(userId)] },
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

/** Count tracks per decade (e.g. "2010s"), oldest first. */
export function decadeBreakdown(
  tracks: Track[],
): { decade: string; count: number }[] {
  const counts = new Map<number, number>();
  for (const track of tracks) {
    if (track.releaseYear == null) continue;
    const decade = Math.floor(track.releaseYear / 10) * 10;
    counts.set(decade, (counts.get(decade) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, count]) => ({ decade: `${decade}s`, count }));
}
