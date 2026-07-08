import { isTimeRange, type TimeRange } from "@/lib/musicData";
import { sampleReceiptModels, SAMPLE_RANGES } from "@/lib/sampleData";
import { encodeShareToken } from "@/lib/shareToken";
import { ReceiptStage } from "@/components/ReceiptStage";
import { DemoBanner } from "@/components/DemoBanner";

export const metadata = {
  title: "Demo",
  description: "A sample Spotify Receipt — the real UI with example data, no login needed.",
};

// PUBLIC demo — no auth. Renders the real dashboard UI with sample data so
// anyone can click through the app despite Spotify's allowlist limit.
export default async function DemoPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const initialRange: TimeRange = isTimeRange(range) ? range : "medium_term";

  const models = sampleReceiptModels();
  const shareTokens = Object.fromEntries(
    SAMPLE_RANGES.map((r) => [r, encodeShareToken(models[r])]),
  ) as Record<TimeRange, string>;

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-5 p-6">
      <DemoBanner />
      <ReceiptStage initialRange={initialRange} models={models} shareTokens={shareTokens} demo />
    </main>
  );
}
