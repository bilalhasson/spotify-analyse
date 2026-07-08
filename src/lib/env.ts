// Env vars are read lazily (at request time, not module load) so that
// `next build` / static analysis never fails on a missing value.
function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  spotifyClientId: () => required("SPOTIFY_CLIENT_ID"),
  spotifyRedirectUri: () => required("SPOTIFY_REDIRECT_URI"),
  sessionSecret: () => required("SESSION_SECRET"),
  // Public origin of the app. Derived from the redirect URI so it's correct in
  // every environment. Do NOT build redirects from `request.url` — behind a
  // proxy (Railway) that resolves to the internal host (e.g. localhost:8080).
  appBaseUrl: () => new URL(required("SPOTIFY_REDIRECT_URI")).origin,
};
