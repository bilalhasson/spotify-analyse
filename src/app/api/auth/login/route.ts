import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  buildAuthorizeUrl,
  codeChallenge,
  generateCodeVerifier,
  generateState,
} from "@/lib/spotify";

export async function GET() {
  const session = await getSession();

  const verifier = generateCodeVerifier();
  const state = generateState();
  session.codeVerifier = verifier;
  session.oauthState = state;
  await session.save();

  const url = buildAuthorizeUrl({ state, challenge: codeChallenge(verifier) });
  return NextResponse.redirect(url);
}
