import { describe, expect, it } from "vitest";
import { topGenres, type Artist } from "@/lib/musicData";

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
