import { type NextRequest } from "next/server";
import { decodeShareToken } from "@/lib/shareToken";
import { renderReceiptImage } from "@/lib/og";

// PUBLIC (no auth) — the receipt is carried, signed, in the token. This is what
// social crawlers fetch for the unfurl preview.
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("t") ?? "";
  const model = decodeShareToken(token);
  if (!model) return new Response("Invalid share link", { status: 400 });
  return renderReceiptImage(model);
}
