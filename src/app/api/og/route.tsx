import { ImageResponse } from "next/og";
import { ogFonts } from "@/lib/og";
import { receiptTheme as t } from "@/lib/receiptTheme";

// Static, public 1200x630 brand card for unfurling the site link (no data).
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: t.desk,
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Geist Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 620,
            background: t.paper,
            color: t.ink,
            padding: "48px 44px",
            boxShadow: "0 24px 60px rgba(40,34,22,0.25)",
          }}
        >
          <div style={{ display: "flex", color: t.accent, fontSize: 22, fontWeight: 700, letterSpacing: 3, textTransform: "uppercase" }}>
            *** Spotify Receipt ***
          </div>
          <div style={{ display: "flex", height: 0, borderTop: `2px dashed ${t.line}`, margin: "22px 0" }} />
          <div style={{ display: "flex", fontSize: 60, fontWeight: 700, lineHeight: 1.05, textTransform: "uppercase" }}>
            Your listening, printed
          </div>
          <div style={{ display: "flex", color: t.muted, fontSize: 24, marginTop: 20 }}>
            top artists · tracks · genres · decades
          </div>
          <div style={{ display: "flex", gap: 4, height: 48, marginTop: 34 }}>
            {[3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2, 1, 3].map((w, i) => (
              <div key={i} style={{ display: "flex", width: w * 4, background: i % 2 === 0 ? t.ink : "transparent" }} />
            ))}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630, fonts: ogFonts() },
  );
}
