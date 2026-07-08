import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Derive the public origin for absolute metadata URLs; never throw at build time.
function baseUrl(): URL | undefined {
  const uri = process.env.SPOTIFY_REDIRECT_URI;
  try {
    return uri ? new URL(new URL(uri).origin) : undefined;
  } catch {
    return undefined;
  }
}

const title = "Spotify Receipt — your listening, printed";
const description = "A retro-receipt view of your Spotify listening stats.";

export const metadata: Metadata = {
  metadataBase: baseUrl(),
  title: { default: title, template: "%s · Spotify Receipt" },
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [{ url: "/api/og", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/api/og"] },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ece9e2" },
    { media: "(prefers-color-scheme: dark)", color: "#100f0d" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
