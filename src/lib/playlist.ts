import type { Playlist } from "@/lib/musicData";

export interface RankedPlaylist {
  rank: string;
  id: string;
  name: string;
  trackCount: number;
}
export interface MeterRow {
  label: string;
  pct: number; // 0–100, rounded
}

/**
 * A collection-level analysis of the user's playlist library, derived purely
 * from `/me/playlists` metadata (playlist TRACKS are 403 for new apps, so
 * per-playlist composition isn't possible).
 */
export interface PlaylistLibrary {
  total: number;
  totalTracks: number;
  owned: number;
  followed: number;
  collaborative: number;
  averageSize: number;
  biggest: RankedPlaylist[];
  meters: MeterRow[]; // owned vs followed as % of the library
}

const pad = (n: number) => String(n).padStart(2, "0");

export function buildPlaylistLibrary(
  playlists: Playlist[],
  myId: string,
): PlaylistLibrary {
  const total = playlists.length;
  const totalTracks = playlists.reduce((sum, p) => sum + p.trackCount, 0);
  const owned = playlists.filter((p) => p.ownerId === myId).length;
  const followed = total - owned;
  const collaborative = playlists.filter((p) => p.collaborative).length;

  const biggest = [...playlists]
    .sort((a, b) => b.trackCount - a.trackCount)
    .slice(0, 5)
    .map((p, i) => ({
      rank: pad(i + 1),
      id: p.id,
      name: p.name,
      trackCount: p.trackCount,
    }));

  const meters: MeterRow[] =
    total === 0
      ? []
      : [
          { label: "owned", pct: Math.round((owned / total) * 100) },
          { label: "followed", pct: Math.round((followed / total) * 100) },
        ];

  return {
    total,
    totalTracks,
    owned,
    followed,
    collaborative,
    averageSize: total === 0 ? 0 : Math.round(totalTracks / total),
    biggest,
    meters,
  };
}
