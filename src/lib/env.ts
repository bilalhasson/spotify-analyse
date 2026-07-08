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
};
