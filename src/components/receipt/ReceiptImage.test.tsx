import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReceiptImage } from "@/components/receipt/ReceiptImage";
import { buildReceiptModel } from "@/lib/receipt";
import type { Artist, Track } from "@/lib/musicData";

// ReceiptImage targets Satori, but it's plain JSX — this smoke test just proves
// it renders a model without throwing and surfaces the key data.
describe("ReceiptImage", () => {
  it("renders the headline artist and a ranked entry", () => {
    const artists: Artist[] = [
      { id: "1", name: "Fred again..", genres: ["electronica"] },
      { id: "2", name: "Four Tet", genres: [] },
    ];
    const tracks: Track[] = [
      { id: "t", name: "Delilah", artists: ["Fred again.."], releaseYear: 2022 },
    ];
    const model = buildReceiptModel({
      displayName: "bilal",
      range: "medium_term",
      artists,
      tracks,
      recent: [],
    });

    render(<ReceiptImage model={model} />);
    // "Fred again.." appears twice (headline + track artist), so assert on unique bits.
    expect(screen.getAllByText(/fred again\.\./i).length).toBeGreaterThan(0);
    expect(screen.getByText("Delilah")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
  });
});
