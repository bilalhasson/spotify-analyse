import { describe, expect, it } from "vitest";
import { buildPlaylistLibrary } from "@/lib/playlist";
import type { Playlist } from "@/lib/musicData";

const pl = (over: Partial<Playlist>): Playlist => ({
  id: "id",
  name: "n",
  owner: "someone",
  ownerId: "other",
  trackCount: 10,
  collaborative: false,
  ...over,
});

describe("buildPlaylistLibrary", () => {
  const me = "me-123";
  const playlists: Playlist[] = [
    pl({ id: "a", name: "House", ownerId: me, trackCount: 412 }),
    pl({ id: "b", name: "Focus", ownerId: me, trackCount: 88, collaborative: true }),
    pl({ id: "c", name: "Metallica", ownerId: "other", trackCount: 46 }),
  ];

  it("aggregates the collection from list metadata", () => {
    const lib = buildPlaylistLibrary(playlists, me);
    expect(lib.total).toBe(3);
    expect(lib.totalTracks).toBe(546);
    expect(lib.owned).toBe(2);
    expect(lib.followed).toBe(1);
    expect(lib.collaborative).toBe(1);
    expect(lib.averageSize).toBe(182); // round(546/3)
    expect(lib.biggest[0]).toMatchObject({ rank: "01", name: "House", trackCount: 412 });
    expect(lib.meters).toEqual([
      { label: "owned", pct: 67 },
      { label: "followed", pct: 33 },
    ]);
  });

  it("handles an empty library", () => {
    const lib = buildPlaylistLibrary([], me);
    expect(lib.total).toBe(0);
    expect(lib.totalTracks).toBe(0);
    expect(lib.averageSize).toBe(0);
    expect(lib.biggest).toEqual([]);
    expect(lib.meters).toEqual([]);
  });
});
