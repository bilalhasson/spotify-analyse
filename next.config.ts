import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Local dev uses the 127.0.0.1 loopback (Spotify's required redirect host),
  // so allow it for dev-only resources like HMR.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
