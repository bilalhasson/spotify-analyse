import type { Artist, Track, Play, Playlist, TimeRange } from "@/lib/musicData";
import { buildReceiptModel, type ReceiptModel } from "@/lib/receipt";
import { buildPlaylistLibrary, type PlaylistLibrary } from "@/lib/playlist";

// Realistic sample data for the public /demo (Spotify dev mode allows only 5
// allowlisted real users, so visitors can't log in). Clearly a demo persona.
export const DEMO_NAME = "alex rivera";

const artists: Artist[] = [
  { id: "1", name: "Fred again..", genres: ["electronica", "uk garage"] },
  { id: "2", name: "Four Tet", genres: ["electronica"] },
  { id: "3", name: "Bonobo", genres: ["downtempo"] },
  { id: "4", name: "Jamie xx", genres: ["future garage"] },
  { id: "5", name: "Caribou", genres: ["psychedelic"] },
];
const tracks: Track[] = [
  { id: "t1", name: "Delilah (pull me out of this)", artists: ["Fred again.."], releaseYear: 2022 },
  { id: "t2", name: "Romantics", artists: ["Four Tet"], releaseYear: 2020 },
  { id: "t3", name: "Rosewood", artists: ["Bonobo"], releaseYear: 2022 },
  { id: "t4", name: "Gosh", artists: ["Jamie xx"], releaseYear: 2015 },
  { id: "t5", name: "Never Come Back", artists: ["Caribou"], releaseYear: 2020 },
];
const recent: Play[] = [
  { id: "r1", name: "Spirit 2.0", artist: "Sampha", playedAt: "x" },
  { id: "r2", name: "So U Kno", artist: "Overmono", playedAt: "y" },
  { id: "r3", name: "Gorilla", artist: "Little Simz", playedAt: "z" },
];
const playlists: Playlist[] = [
  { id: "p1", name: "House", owner: DEMO_NAME, ownerId: "me", trackCount: 412, collaborative: false },
  { id: "p2", name: "focus flow", owner: DEMO_NAME, ownerId: "me", trackCount: 112, collaborative: false },
  { id: "p3", name: "late night drives", owner: DEMO_NAME, ownerId: "me", trackCount: 47, collaborative: false },
  { id: "p4", name: "gym bangers", owner: DEMO_NAME, ownerId: "me", trackCount: 63, collaborative: true },
  { id: "p5", name: "throwbacks", owner: "a friend", ownerId: "friend", trackCount: 90, collaborative: false },
  { id: "p6", name: "Metallica Greatest Hits", owner: "someone", ownerId: "someone", trackCount: 46, collaborative: false },
  { id: "p7", name: "ambient sleep", owner: DEMO_NAME, ownerId: "me", trackCount: 30, collaborative: false },
];

export const SAMPLE_RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

export function sampleReceiptModels(): Record<TimeRange, ReceiptModel> {
  return Object.fromEntries(
    SAMPLE_RANGES.map((range) => [
      range,
      buildReceiptModel({ displayName: DEMO_NAME, range, artists, tracks, recent }),
    ]),
  ) as Record<TimeRange, ReceiptModel>;
}

export function sampleLibrary(): PlaylistLibrary {
  return buildPlaylistLibrary(playlists, "me");
}
