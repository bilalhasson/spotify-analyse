import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReceiptStage } from "@/components/ReceiptStage";
import { buildReceiptModel } from "@/lib/receipt";
import type { Artist, Track } from "@/lib/musicData";

function model(topArtist: string) {
  const artists: Artist[] = [
    { id: topArtist, name: topArtist, genres: [] },
    { id: "x", name: "Second", genres: [] },
  ];
  const tracks: Track[] = [{ id: "t", name: "Track", artists: [topArtist] }];
  return buildReceiptModel({
    displayName: "me",
    range: "medium_term",
    artists,
    tracks,
    recent: [],
  });
}

describe("ReceiptStage", () => {
  it("shows the initial range and switches in place on toggle", () => {
    const models = {
      short_term: model("SHORTY"),
      medium_term: model("MIDDY"),
      long_term: model("LONGY"),
    };

    const shareTokens = { short_term: "a", medium_term: "b", long_term: "c" };
    render(
      <ReceiptStage initialRange="medium_term" models={models} shareTokens={shareTokens} />,
    );
    expect(screen.getByRole("heading", { name: /middy/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("link", { name: /4 weeks/i }));
    expect(screen.getByRole("heading", { name: /shorty/i })).toBeInTheDocument();
  });
});
