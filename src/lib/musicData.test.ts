import { describe, expect, it } from "vitest";
import { decadeBreakdown, topGenres, type Artist, type Track } from "@/lib/musicData";

describe("topGenres", () => {
  it("counts genres across artists, most common first", () => {
    const artists: Artist[] = [
      { id: "1", name: "A", genres: ["pop", "rock"] },
      { id: "2", name: "B", genres: ["pop"] },
    ];
    expect(topGenres(artists)).toEqual([
      { genre: "pop", count: 2 },
      { genre: "rock", count: 1 },
    ]);
  });

  it("does not throw when an artist has missing/undefined genres", () => {
    // Spotify can return artists without a `genres` field.
    const artists = [
      { id: "1", name: "A", genres: ["pop"] },
      { id: "2", name: "B" } as unknown as Artist, // genres missing
    ];
    expect(() => topGenres(artists)).not.toThrow();
    expect(topGenres(artists)).toEqual([{ genre: "pop", count: 1 }]);
  });
});

describe("decadeBreakdown", () => {
  it("buckets tracks by decade, oldest first, ignoring unknown years", () => {
    const tracks: Track[] = [
      { id: "1", name: "a", artists: [], releaseYear: 1998 },
      { id: "2", name: "b", artists: [], releaseYear: 1995 },
      { id: "3", name: "c", artists: [], releaseYear: 2011 },
      { id: "4", name: "d", artists: [] }, // no releaseYear -> skipped
    ];
    expect(decadeBreakdown(tracks)).toEqual([
      { decade: "1990s", count: 2 },
      { decade: "2010s", count: 1 },
    ]);
  });
});
