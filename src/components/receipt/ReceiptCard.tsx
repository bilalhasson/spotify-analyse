import { isReceiptEmpty, type ReceiptModel } from "@/lib/receipt";
import { Barcode } from "./Barcode";
import { RankRow } from "./RankRow";
import { Receipt } from "./Receipt";
import { Row } from "./Row";
import { Section } from "./Section";
import { Stamp } from "./Stamp";

/**
 * Presentational receipt built entirely from a ReceiptModel — no data fetching,
 * so it can be reused by the dashboard and the Phase 3 image export.
 */
export function ReceiptCard({ model }: { model: ReceiptModel }) {
  const {
    displayName,
    dateLabel,
    rangeLabel,
    topArtist,
    otherArtists,
    topTracks,
    genres,
    recent,
    topDecade,
  } = model;

  return (
    <Receipt>
      <Stamp>Top tier</Stamp>

      <p className="m-0 text-[10.5px] font-extrabold uppercase tracking-[0.04em] text-accent">
        Your sound · {rangeLabel}
      </p>
      <p className="mb-3.5 mt-1 text-[11px] uppercase tracking-[0.06em] text-paper-muted">
        {displayName} · {dateLabel}
      </p>

      {isReceiptEmpty(model) ? (
        <>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <p className="py-2 text-paper-muted">
            No listening on record for this window yet. Play some music and check
            back — or try a longer time range.
          </p>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <Barcode />
        </>
      ) : (
        <>
      {topArtist && (
        <div>
          <p className="mb-0.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-accent">
            01 · Top artist
          </p>
          <h2 className="m-0 font-sans text-[30px] font-extrabold uppercase leading-[0.92] tracking-[-0.03em]">
            {topArtist.name}
          </h2>
          {topArtist.genres.length > 0 && (
            <p className="mt-1.5 text-[11px] text-paper-muted">
              {topArtist.genres.slice(0, 2).join(" · ")}
            </p>
          )}
        </div>
      )}

      {otherArtists.length > 0 && (
        <Section label="On heavy rotation">
          {otherArtists.map((a) => (
            <RankRow key={a.rank} rank={a.rank} name={a.name} big />
          ))}
        </Section>
      )}

      {topTracks.length > 0 && (
        <Section label="Top tracks">
          {topTracks.map((t) => (
            <RankRow key={t.rank} rank={t.rank} name={t.name} value={t.value} />
          ))}
        </Section>
      )}

      {genres.length > 0 && (
        <Section label="Genre mix">
          <Row left={genres.join(" · ")} />
        </Section>
      )}

      {recent.length > 0 && (
        <Section label="Last played">
          {recent.map((r) => (
            <Row key={`${r.name}-${r.artist}`} left={r.name} right={r.artist} />
          ))}
        </Section>
      )}

      {topDecade && (
        <>
          <hr className="my-3.5 border-0 border-t border-dashed border-paper-line" />
          <div className="flex justify-between font-sans text-[15px] font-extrabold">
            <span>{topDecade.decade} era</span>
            <span className="tabular-nums">{topDecade.share}%</span>
          </div>
        </>
      )}

      <Barcode />
        </>
      )}
    </Receipt>
  );
}
