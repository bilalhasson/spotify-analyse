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
  it("round-trips a model through encode/decode", () => {
    expect(decodeShareToken(encodeShareToken(model))).toEqual(model);
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
