import type { ReactNode } from "react";
import type { ReceiptModel } from "@/lib/receipt";
import { receiptTheme as t } from "@/lib/receiptTheme";

/**
 * Satori-only receipt renderer for the shareable PNG (next/og). Uses inline
 * styles and a monospace font — NOT for the DOM (the app uses ReceiptCard).
 * Every element with multiple children sets display:flex, as Satori requires.
 * Shares the ReceiptModel + palette with the on-screen card.
 */
export function ReceiptImage({ model }: { model: ReceiptModel }) {
  const { displayName, dateLabel, rangeLabel, topArtist, otherArtists, topTracks, genres, recent, topDecade } = model;

  return (
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
          width: 560,
          background: t.paper,
          color: t.ink,
          padding: "48px 44px",
          boxShadow: "0 24px 60px rgba(40,34,22,0.25)",
        }}
      >
        {/* masthead + stamp */}
        <div style={{ display: "flex", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", color: t.accent, fontSize: 18, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>
              Your sound · {rangeLabel}
            </div>
            <div style={{ display: "flex", color: t.muted, fontSize: 18, letterSpacing: 1, textTransform: "uppercase", marginTop: 6 }}>
              {displayName} · {dateLabel}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              top: 0,
              right: 0,
              transform: "rotate(9deg)",
              border: `3px solid ${t.accent}`,
              borderRadius: 8,
              color: t.accent,
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: 1.5,
              padding: "5px 10px",
              textTransform: "uppercase",
            }}
          >
            Top tier
          </div>
        </div>

        {topArtist && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 34 }}>
            <div style={{ display: "flex", color: t.accent, fontSize: 17, fontWeight: 700, letterSpacing: 2.5, textTransform: "uppercase" }}>
              01 · Top artist
            </div>
            <div style={{ display: "flex", fontSize: 62, fontWeight: 700, lineHeight: 1, textTransform: "uppercase", marginTop: 6 }}>
              {topArtist.name}
            </div>
            {topArtist.genres.length > 0 && (
              <div style={{ display: "flex", color: t.muted, fontSize: 19, marginTop: 12 }}>
                {topArtist.genres.slice(0, 2).join(" · ")}
              </div>
            )}
          </div>
        )}

        <ImgSection label="On heavy rotation">
          {otherArtists.map((a) => (
            <ImgRow key={a.rank} rank={a.rank} left={a.name} bold />
          ))}
        </ImgSection>

        <ImgSection label="Top tracks">
          {topTracks.map((track) => (
            <ImgRow key={track.rank} rank={track.rank} left={track.name} right={track.value} />
          ))}
        </ImgSection>

        {genres.length > 0 && (
          <ImgSection label="Genre mix">
            <div style={{ display: "flex", fontSize: 20 }}>{genres.slice(0, 4).join(" · ")}</div>
          </ImgSection>
        )}

        {recent.length > 0 && (
          <ImgSection label="Last played">
            {recent.map((r) => (
              <ImgRow key={`${r.name}-${r.artist}`} left={r.name} right={r.artist} />
            ))}
          </ImgSection>
        )}

        {topDecade && (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <ImgDivider />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, fontWeight: 700 }}>
              <div style={{ display: "flex" }}>{topDecade.decade} era</div>
              <div style={{ display: "flex" }}>{topDecade.share}%</div>
            </div>
          </div>
        )}

        <ImgBarcode />
      </div>
    </div>
  );
}

function ImgDivider() {
  return <div style={{ display: "flex", height: 0, borderTop: `2px dashed ${t.line}`, margin: "22px 0" }} />;
}

function ImgSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <ImgDivider />
      <div style={{ display: "flex", color: t.accent, fontSize: 16, letterSpacing: 3, textTransform: "uppercase", marginBottom: 10 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>{children}</div>
    </div>
  );
}

function ImgRow({ rank, left, right, bold }: { rank?: string; left: string; right?: string; bold?: boolean }) {
  const truncate = { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } as const;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, fontSize: bold ? 24 : 21, fontWeight: bold ? 700 : 400 }}>
      <div style={{ display: "flex", flexGrow: 1, flexShrink: 1, flexBasis: 0, minWidth: 0 }}>
        {rank && <span style={{ color: t.accent, fontWeight: 700, marginRight: 12, flexShrink: 0 }}>{rank}</span>}
        <div style={{ flexGrow: 1, minWidth: 0, ...truncate }}>{left}</div>
      </div>
      {right && (
        <div style={{ flexShrink: 0, maxWidth: "42%", color: t.muted, ...truncate }}>{right}</div>
      )}
    </div>
  );
}

function ImgBarcode() {
  // Satori can't do repeating gradients, so draw discrete bars.
  const widths = [3, 1, 2, 4, 1, 3, 1, 2, 1, 4, 2, 1, 3, 1, 2, 3, 1, 4, 1, 2, 3, 1, 2, 1, 3, 2, 1, 4, 1, 2, 3, 1];
  return (
    <div style={{ display: "flex", gap: 2, height: 52, marginTop: 22 }}>
      {widths.map((w, i) => (
        <div key={i} style={{ display: "flex", width: w, background: i % 2 === 0 ? t.ink : "transparent" }} />
      ))}
    </div>
  );
}
