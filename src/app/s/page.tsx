import type { Metadata } from "next";
import Link from "next/link";
import { env } from "@/lib/env";
import { decodeShareToken } from "@/lib/shareToken";
import { ReceiptCard } from "@/components/receipt";

type SearchParams = Promise<{ t?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const { t } = await searchParams;
  const model = t ? decodeShareToken(t) : null;
  if (!model) return { title: "Spotify Receipt" };

  const image = `${env.appBaseUrl()}/api/share-image?t=${encodeURIComponent(t!)}`;
  const title = `${model.displayName}'s receipt · ${model.rangeLabel}`;
  const description = model.topArtist
    ? `#1 ${model.topArtist.name}`
    : "A receipt of my listening.";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image, width: 720, height: 1280 }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function SharePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { t } = await searchParams;
  const model = t ? decodeShareToken(t) : null;

  if (!model) {
    return (
      <main className="flex flex-1 items-center justify-center p-6 font-mono text-sm text-foreground/60">
        This share link is invalid or expired.
      </main>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6">
      <ReceiptCard model={model} />
      <Link
        href="/"
        className="font-mono text-xs text-foreground/50 transition-colors hover:text-accent"
      >
        make your own →
      </Link>
    </main>
  );
}
