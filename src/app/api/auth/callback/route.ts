import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { getSession } from "@/lib/session";
import { exchangeCodeForTokens, spotifyGet } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const base = env.appBaseUrl();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, base));
  }
  // CSRF / integrity checks: state must match and the PKCE verifier must exist.
  if (!code || !state || state !== session.oauthState || !session.codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_state", base));
  }

  const tokens = await exchangeCodeForTokens(code, session.codeVerifier);
  session.accessToken = tokens.access_token;
  session.refreshToken = tokens.refresh_token ?? session.refreshToken;
  session.expiresAt = Date.now() + tokens.expires_in * 1000;
  session.codeVerifier = undefined;
  session.oauthState = undefined;

  // Capture identity for use as the per-user stats cache key.
  const profile = await spotifyGet<{ id: string; display_name?: string }>(
    "/me",
    tokens.access_token,
  );
  if (profile.data) {
    session.userId = profile.data.id;
    session.displayName = profile.data.display_name;
  }
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", base));
}
