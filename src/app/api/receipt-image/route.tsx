import { type NextRequest } from "next/server";
import { isTimeRange } from "@/lib/musicData";
import { loadReceiptModel } from "@/lib/dashboardData";
import { getSession } from "@/lib/session";
import { renderReceiptImage } from "@/lib/og";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session.accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const rangeParam = new URL(request.url).searchParams.get("range") ?? undefined;
  const range = isTimeRange(rangeParam) ? rangeParam : "medium_term";
  const model = await loadReceiptModel(session, range);

  return renderReceiptImage(model);
}
