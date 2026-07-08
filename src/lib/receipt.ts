import {
  decadeBreakdown,
  TIME_RANGES,
  topGenres,
  type Artist,
  type Play,
  type TimeRange,
  type Track,
} from "@/lib/musicData";

export interface RankedItem {
  rank: string;
  name: string;
  value?: string;
}

/** Everything the ReceiptCard needs — derived once, then rendered. */
export interface ReceiptModel {
  displayName: string;
  dateLabel: string;
  rangeLabel: string;
  topArtist?: Artist;
  otherArtists: RankedItem[];
  topTracks: RankedItem[];
  genres: string[];
  recent: { name: string; artist: string }[];
  topDecade?: { decade: string; share: number };
}

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
];

// In a lib module (not a component) so the impure `new Date()` doesn't trip
// React Compiler's purity rule.
function todayLabel(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

const pad = (n: number) => String(n).padStart(2, "0");

/** Dominant release decade and its share of dated tracks (real, derivable). */
export function topDecadeShare(
  tracks: Track[],
): { decade: string; share: number } | undefined {
  const decades = decadeBreakdown(tracks);
  if (decades.length === 0) return undefined;
  const total = decades.reduce((sum, d) => sum + d.count, 0);
  const top = decades.reduce((a, b) => (b.count > a.count ? b : a));
  return { decade: top.decade, share: Math.round((top.count / total) * 100) };
}

export function buildReceiptModel(input: {
  displayName: string;
  range: TimeRange;
  artists: Artist[];
  tracks: Track[];
  recent: Play[];
}): ReceiptModel {
  const { displayName, range, artists, tracks, recent } = input;
  return {
    displayName: displayName.toUpperCase(),
    dateLabel: todayLabel(),
    rangeLabel: TIME_RANGES.find((r) => r.value === range)?.label ?? "",
    topArtist: artists[0],
    // #1 is the headline, so the list runs from #2.
    otherArtists: artists.slice(1, 5).map((a, i) => ({
      rank: pad(i + 2),
      name: a.name,
    })),
    topTracks: tracks.slice(0, 4).map((t, i) => ({
      rank: pad(i + 1),
      name: t.name,
      value: t.artists[0],
    })),
    genres: topGenres(artists, 5).map((g) => g.genre),
    recent: recent.slice(0, 3).map((p) => ({ name: p.name, artist: p.artist })),
    topDecade: topDecadeShare(tracks),
  };
}
