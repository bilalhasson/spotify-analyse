import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { refreshTokens } from "@/lib/spotify";

// Cookies can only be written from route handlers (not Server Components), so
// pages redirect here to refresh an expired token, then return to `returnTo`.
export async function GET(request: NextRequest) {
  const session = await getSession();
  const returnTo = new URL(request.url).searchParams.get("returnTo") ?? "/dashboard";

  if (!session.refreshToken) {
    return NextResponse.redirect(new URL("/api/auth/login", request.url));
  }

  const tokens = await refreshTokens(session.refreshToken);
  session.accessToken = tokens.access_token;
  if (tokens.refresh_token) session.refreshToken = tokens.refresh_token;
  session.expiresAt = Date.now() + tokens.expires_in * 1000;
  await session.save();

  return NextResponse.redirect(new URL(returnTo, request.url));
}
