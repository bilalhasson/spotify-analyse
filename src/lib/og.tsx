import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { ReceiptImage } from "@/components/receipt/ReceiptImage";
import type { ReceiptModel } from "@/lib/receipt";

// Fonts are bundled in the repo and read at request time (Node runtime), so no
// network fetch is needed to render the image.
function fonts() {
  const dir = join(process.cwd(), "src/og-fonts");
  return [
    { name: "Geist Mono", data: readFileSync(join(dir, "GeistMono-400.woff")), weight: 400 as const, style: "normal" as const },
    { name: "Geist Mono", data: readFileSync(join(dir, "GeistMono-700.woff")), weight: 700 as const, style: "normal" as const },
  ];
}

/** Render a ReceiptModel to a portrait (9:16, story-friendly) PNG. */
export function renderReceiptImage(model: ReceiptModel) {
  return new ImageResponse(<ReceiptImage model={model} />, {
    width: 720,
    height: 1280,
    fonts: fonts(),
  });
}
