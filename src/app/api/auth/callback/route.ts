import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { exchangeCodeForTokens } from "@/lib/spotify";

export async function GET(request: NextRequest) {
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error)}`, request.url));
  }
  // CSRF / integrity checks: state must match and the PKCE verifier must exist.
  if (!code || !state || state !== session.oauthState || !session.codeVerifier) {
    return NextResponse.redirect(new URL("/?error=invalid_state", request.url));
  }

  const tokens = await exchangeCodeForTokens(code, session.codeVerifier);
  session.accessToken = tokens.access_token;
  session.refreshToken = tokens.refresh_token ?? session.refreshToken;
  session.expiresAt = Date.now() + tokens.expires_in * 1000;
  session.codeVerifier = undefined;
  session.oauthState = undefined;
  await session.save();

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
