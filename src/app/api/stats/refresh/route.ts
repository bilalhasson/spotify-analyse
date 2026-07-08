import { NextResponse, type NextRequest } from "next/server";
import { revalidateTag } from "next/cache";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { isTimeRange, statsTag } from "@/lib/musicData";

// Invalidate this user's cached stats, then bounce back to the dashboard.
export async function GET(request: NextRequest) {
  const session = await getSession();
  const base = env.appBaseUrl();

  if (!session.accessToken || !session.userId) {
    return NextResponse.redirect(new URL("/api/auth/login", base));
  }

  // Next 16 requires a profile; { expire: 0 } purges immediately.
  revalidateTag(statsTag(session.userId), { expire: 0 });

  const range = new URL(request.url).searchParams.get("range") ?? undefined;
  const dest = isTimeRange(range) ? `/dashboard?range=${range}` : "/dashboard";
  return NextResponse.redirect(new URL(dest, base));
}
