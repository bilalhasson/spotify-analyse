import { getIronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * Server-side session. Stored in an encrypted, httpOnly cookie so Spotify
 * tokens are never readable by client JavaScript.
 */
export interface SessionData {
  // Transient PKCE state (set at /login, cleared at /callback).
  codeVerifier?: string;
  oauthState?: string;
  // Tokens (set at /callback, refreshed at /refresh).
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number; // epoch milliseconds
}

function sessionOptions(): SessionOptions {
  return {
    password: env.sessionSecret(),
    cookieName: "spotify_receipt_session",
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions());
}

/** True if the access token is missing, expired, or within 30s of expiry. */
export function needsRefresh(session: SessionData): boolean {
  if (!session.expiresAt) return false;
  return Date.now() > session.expiresAt - 30_000;
}
