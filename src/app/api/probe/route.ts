import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { spotifyGet } from "@/lib/spotify";

// Empirically records which Web API endpoints a brand-new app can actually
// call (200) vs those deprecated for new apps (403). Phase 0 "API truth".
const TARGETS: Array<{ name: string; path: string; note?: string }> = [
  { name: "profile", path: "/me" },
  { name: "top artists", path: "/me/top/artists?limit=1" },
  { name: "top tracks", path: "/me/top/tracks?limit=1" },
  { name: "recently played", path: "/me/player/recently-played?limit=1" },
  { name: "saved tracks", path: "/me/tracks?limit=1" },
  { name: "playlists", path: "/me/playlists?limit=1" },
  { name: "audio-features", path: "/audio-features/11dFghVXANMlKmJXsNCbNl", note: "expected 403" },
  {
    name: "recommendations",
    path: "/recommendations?seed_artists=4NHQUGzhtTLFvgF5SZesLK",
    note: "expected 403",
  },
];

export async function GET() {
  const session = await getSession();
  if (!session.accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  const results = [];
  for (const target of TARGETS) {
    try {
      const { status } = await spotifyGet(target.path, session.accessToken);
      results.push({ ...target, status });
    } catch {
      results.push({ ...target, status: "error" });
    }
  }
  return NextResponse.json({ results });
}
