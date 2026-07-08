import { describe, expect, it } from "vitest";

// shareToken reads SESSION_SECRET via env; set one before importing.
process.env.SESSION_SECRET ||= "test-secret-at-least-32-chars-long!!";

const { encodeShareToken, decodeShareToken } = await import("@/lib/shareToken");
const { buildReceiptModel } = await import("@/lib/receipt");

const model = buildReceiptModel({
  displayName: "bilal",
  range: "medium_term",
  artists: [{ id: "1", name: "Fred again..", genres: ["electronica"] }],
  tracks: [{ id: "t", name: "Delilah", artists: ["Fred again.."], releaseYear: 2022 }],
  recent: [],
});

describe("shareToken", () => {
  it("round-trips the rendered content (topArtist.id is dropped to save space)", () => {
    const decoded = decodeShareToken(encodeShareToken(model));
    expect(decoded).toEqual({ ...model, topArtist: { ...model.topArtist!, id: "" } });
    // everything the renderers actually use survives:
    expect(decoded?.topArtist?.name).toBe("Fred again..");
    expect(decoded?.rangeLabel).toBe(model.rangeLabel);
    expect(decoded?.topTracks).toEqual(model.topTracks);
  });

  it("produces a shorter token than raw base64 JSON", () => {
    const token = encodeShareToken(model);
    const rawLen = Buffer.from(JSON.stringify(model)).toString("base64url").length;
    expect(token.length).toBeLessThan(rawLen);
  });

  it("rejects a tampered payload", () => {
    const token = encodeShareToken(model);
    const [data, sig] = token.split(".");
    const forged = `${data.slice(0, -2)}XY.${sig}`;
    expect(decodeShareToken(forged)).toBeNull();
  });

  it("rejects malformed tokens", () => {
    expect(decodeShareToken("nonsense")).toBeNull();
    expect(decodeShareToken("")).toBeNull();
  });
});
