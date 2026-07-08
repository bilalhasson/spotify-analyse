import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";
import type { ReceiptModel } from "@/lib/receipt";

/**
 * Stateless share tokens: the receipt model is base64url-encoded and HMAC-signed
 * into the URL, so a public page/image can render it with no datastore and no
 * session. The signature means only the server can mint a token — visitors can't
 * craft an arbitrary receipt under our domain.
 */

function sign(data: string): string {
  return createHmac("sha256", env.sessionSecret()).update(data).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function encodeShareToken(model: ReceiptModel): string {
  const data = Buffer.from(JSON.stringify(model)).toString("base64url");
  return `${data}.${sign(data)}`;
}

export function decodeShareToken(token: string): ReceiptModel | null {
  const dot = token.lastIndexOf(".");
  if (dot < 1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(data))) return null;
  try {
    return JSON.parse(Buffer.from(data, "base64url").toString()) as ReceiptModel;
  } catch {
    return null;
  }
}
