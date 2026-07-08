import type { PlaylistLibrary } from "@/lib/playlist";
import { Barcode } from "./Barcode";
import { Meter } from "./Meter";
import { Receipt } from "./Receipt";
import { Row } from "./Row";
import { Section } from "./Section";

const fmt = (n: number) => n.toLocaleString("en-US");

/** Collection-level analysis of the user's playlist library (metadata only). */
export function LibraryReceipt({ library }: { library: PlaylistLibrary }) {
  const { total, totalTracks, owned, followed, collaborative, averageSize, biggest, meters } =
    library;

  return (
    <Receipt>
      <p className="m-0 text-[10.5px] font-extrabold uppercase tracking-[0.06em] text-accent">
        Your library
      </p>
      <h1 className="mt-0.5 font-sans text-[26px] font-extrabold uppercase leading-[0.95] tracking-[-0.02em]">
        {fmt(total)} playlists
      </h1>
      <p className="mt-2 text-[10.5px] uppercase tracking-[0.04em] text-paper-muted">
        {fmt(totalTracks)} tracks · {fmt(averageSize)} avg
      </p>

      {total === 0 ? (
        <>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <p className="py-2 text-paper-muted">
            No playlists yet. Make or follow a few in Spotify and they&apos;ll
            show up here.
          </p>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <Barcode />
        </>
      ) : (
        <>
      <Section label="Breakdown">
        <Row left="Owned" right={fmt(owned)} />
        <Row left="Followed" right={fmt(followed)} />
        {collaborative > 0 && <Row left="Collaborative" right={fmt(collaborative)} />}
      </Section>

      {meters.length > 0 && (
        <Section label="Owned vs followed">
          {meters.map((m) => (
            <Meter key={m.label} label={m.label} pct={m.pct} />
          ))}
        </Section>
      )}

      {biggest.length > 0 && (
        <Section label="Biggest playlists">
          {biggest.map((p) => (
            <a
              key={p.id}
              href={`https://open.spotify.com/playlist/${p.id}`}
              target="_blank"
              rel="noreferrer"
              className="receipt-link"
            >
              <span className="receipt-link-name min-w-0 truncate">
                <span className="mr-2 font-extrabold tabular-nums text-accent">{p.rank}</span>
                {p.name}
              </span>
              <span className="shrink-0 tabular-nums text-paper-muted">
                {fmt(p.trackCount)} <span className="receipt-link-arrow">→</span>
              </span>
            </a>
          ))}
        </Section>
      )}

      <Barcode />
        </>
      )}
    </Receipt>
  );
}
