import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the receipt header", () => {
    render(<Home />);
    expect(screen.getByText(/SPOTIFY RECEIPT/i)).toBeInTheDocument();
  });
});
