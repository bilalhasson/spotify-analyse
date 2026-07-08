import { redirect } from "next/navigation";
import { getSession, needsRefresh } from "@/lib/session";
import { isTimeRange, type TimeRange } from "@/lib/musicData";
import { loadReceiptModels } from "@/lib/dashboardData";
import { encodeShareToken } from "@/lib/shareToken";
import { ReceiptStage } from "@/components/ReceiptStage";

const RANGES: TimeRange[] = ["short_term", "medium_term", "long_term"];

export default async function Dashboard({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const session = await getSession();
  if (!session.accessToken) redirect("/api/auth/login");
  if (needsRefresh(session)) redirect("/api/auth/refresh?returnTo=/dashboard");

  const sp = await searchParams;
  const initialRange: TimeRange = isTimeRange(sp.range) ? sp.range : "medium_term";

  // Prefetch every range (all reads are cached) so the client toggle is instant.
  const models = await loadReceiptModels(session, RANGES);

  // Signed share tokens are minted server-side (they need the secret).
  const shareTokens = Object.fromEntries(
    RANGES.map((range) => [range, encodeShareToken(models[range])]),
  ) as Record<TimeRange, string>;

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <ReceiptStage initialRange={initialRange} models={models} shareTokens={shareTokens} />
    </main>
  );
}
