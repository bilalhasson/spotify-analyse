import { describe, expect, it } from "vitest";
import { buildReceiptModel, isReceiptEmpty, topDecadeShare } from "@/lib/receipt";
import type { Artist, Play, Track } from "@/lib/musicData";

describe("isReceiptEmpty", () => {
  const base = buildReceiptModel({
    displayName: "x",
    range: "short_term",
    artists: [],
    tracks: [],
    recent: [],
  });
  it("is true when there is no listening data", () => {
    expect(isReceiptEmpty(base)).toBe(true);
  });
  it("is false when there is any data", () => {
    const withData = buildReceiptModel({
      displayName: "x",
      range: "short_term",
      artists: [{ id: "1", name: "A", genres: [] }],
      tracks: [],
      recent: [],
    });
    expect(isReceiptEmpty(withData)).toBe(false);
  });
});

describe("topDecadeShare", () => {
  it("returns the dominant decade and its rounded share", () => {
    const tracks: Track[] = [
      { id: "1", name: "a", artists: [], releaseYear: 2021 },
      { id: "2", name: "b", artists: [], releaseYear: 2022 },
      { id: "3", name: "c", artists: [], releaseYear: 2015 },
    ];
    expect(topDecadeShare(tracks)).toEqual({ decade: "2020s", share: 67 });
  });

  it("returns undefined when no tracks have a year", () => {
    expect(topDecadeShare([{ id: "1", name: "a", artists: [] }])).toBeUndefined();
  });
});

describe("buildReceiptModel", () => {
  it("makes #1 the headline, ranks others from 02, tracks from 01", () => {
    const artists: Artist[] = [
      { id: "1", name: "Fred again..", genres: ["electronica"] },
      { id: "2", name: "Four Tet", genres: [] },
      { id: "3", name: "Bonobo", genres: [] },
    ];
    const tracks: Track[] = [
      { id: "t1", name: "Delilah", artists: ["Fred again.."], releaseYear: 2021 },
    ];
    const recent: Play[] = [
      { id: "r1", name: "Spirit 2.0", artist: "Sampha", playedAt: "x" },
    ];

    const m = buildReceiptModel({
      displayName: "bilal",
      range: "medium_term",
      artists,
      tracks,
      recent,
    });

    expect(m.displayName).toBe("BILAL");
    expect(m.rangeLabel).toBe("6 months");
    expect(m.topArtist?.name).toBe("Fred again..");
    expect(m.otherArtists.map((a) => a.rank)).toEqual(["02", "03"]);
    expect(m.topTracks[0]).toMatchObject({
      rank: "01",
      name: "Delilah",
      value: "Fred again..",
    });
  });
});
