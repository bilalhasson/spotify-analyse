import { createHmac, timingSafeEqual } from "node:crypto";
import { deflateRawSync, inflateRawSync } from "node:zlib";
import { env } from "@/lib/env";
import type { ReceiptModel } from "@/lib/receipt";

/**
 * Stateless share tokens: the receipt model is deflate-compressed, base64url-
 * encoded, and HMAC-signed into the URL, so a public page/image can render it
 * with no datastore and no session. The signature means only the server can
 * mint a token — visitors can't craft an arbitrary receipt under our domain.
 *
 * Token = `<base64url(deflate(json))>.<base64url(hmac[:16])>`. Compression
 * roughly halves the payload; a 128-bit signature is ample for this low-value,
 * non-secret use and keeps the URL short.
 */

function sign(data: string): string {
  return createHmac("sha256", env.sessionSecret())
    .update(data)
    .digest()
    .subarray(0, 16)
    .toString("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

/** Strip fields the renderers don't use, to keep the token small. */
function slim(model: ReceiptModel): ReceiptModel {
  return {
    ...model,
    topArtist: model.topArtist
      ? { id: "", name: model.topArtist.name, genres: model.topArtist.genres }
      : undefined,
  };
}

export function encodeShareToken(model: ReceiptModel): string {
  const json = JSON.stringify(slim(model));
  const data = deflateRawSync(json).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function decodeShareToken(token: string): ReceiptModel | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  // Verify the signature BEFORE decompressing, so only our own data is inflated.
  if (!safeEqual(sig, sign(data))) return null;
  try {
    const json = inflateRawSync(Buffer.from(data, "base64url")).toString();
    return JSON.parse(json) as ReceiptModel;
  } catch {
    return null;
  }
}
