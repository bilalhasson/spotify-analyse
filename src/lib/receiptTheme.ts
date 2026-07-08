/**
 * Receipt palette as JS constants — for the Satori image renderer, which takes
 * inline styles only (no CSS custom properties). Mirrors the light-theme tokens
 * in globals.css; the shareable image is always the light "paper" look.
 */
export const receiptTheme = {
  desk: "#ece9e2",
  paper: "#fbfaf7",
  ink: "#1a1712",
  muted: "#8a8479",
  line: "#c9c3b6",
  accent: "#c23a26",
} as const;
