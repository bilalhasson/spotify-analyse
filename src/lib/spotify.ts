import { createHash, randomBytes } from "node:crypto";
import { env } from "@/lib/env";

const AUTHORIZE_URL = "https://accounts.spotify.com/authorize";
const TOKEN_URL = "https://accounts.spotify.com/api/token";
const API_BASE = "https://api.spotify.com/v1";

// Phase 0 scope set — enough to empirically probe the endpoints we care about
// so a 403 means "deprecated for new apps" rather than "missing scope".
export const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "user-library-read",
  "playlist-read-private",
];

// --- PKCE helpers ---------------------------------------------------------

function base64url(buf: Buffer): string {
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64url(randomBytes(64)); // ~86 chars (spec allows 43–128)
}

export function codeChallenge(verifier: string): string {
  return base64url(createHash("sha256").update(verifier).digest());
}

export function generateState(): string {
  return base64url(randomBytes(16));
}

export function buildAuthorizeUrl(params: {
  state: string;
  challenge: string;
}): string {
  const url = new URL(AUTHORIZE_URL);
  url.searchParams.set("client_id", env.spotifyClientId());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", env.spotifyRedirectUri());
  url.searchParams.set("scope", SCOPES.join(" "));
  url.searchParams.set("state", params.state);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("code_challenge", params.challenge);
  return url.toString();
}

// --- Token exchange (all server-side) -------------------------------------

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

async function postToken(body: URLSearchParams): Promise<TokenResponse> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Spotify token request failed: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

export function exchangeCodeForTokens(code: string, verifier: string) {
  return postToken(
    new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: env.spotifyRedirectUri(),
      client_id: env.spotifyClientId(),
      code_verifier: verifier,
    }),
  );
}

export function refreshTokens(refreshToken: string) {
  return postToken(
    new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: env.spotifyClientId(),
    }),
  );
}

// --- Web API fetch --------------------------------------------------------

export async function spotifyGet<T = unknown>(
  path: string,
  accessToken: string,
): Promise<{ status: number; data: T | null }> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  const data = res.ok ? ((await res.json()) as T) : null;
  return { status: res.status, data };
}
