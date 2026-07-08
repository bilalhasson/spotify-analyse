import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

describe("Home", () => {
  it("renders the landing headline and login link", () => {
    render(<Home />);
    expect(screen.getByText(/your spotify, printed/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /log in with spotify/i }),
    ).toBeInTheDocument();
  });
});
