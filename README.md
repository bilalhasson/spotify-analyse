# spotify-analyse

A retro-receipt view of your Spotify listening stats — top artists, tracks, and genres,
rendered as a shareable "receipt". A portfolio project built around a correct, server-side
**OAuth 2.0 (Authorization Code + PKCE)** flow against the Spotify Web API.

🔗 **Live:** https://spotify-analyse-production.up.railway.app
⚙️ **Setup guide:** [`docs/SETUP.md`](docs/SETUP.md)
📐 **Architecture & auth deep-dive:** [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

**Status:** live — Spotify OAuth (PKCE) + a stats dashboard (top artists/tracks, genre
breakdown, 4wk/6mo/all-time toggle), with per-user cached data.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · iron-session · pnpm 10.25 ·
Node 24 · Vitest · GitHub Actions CI · Railway (push-to-deploy).

## Local development

```bash
cp .env.example .env.local     # fill in SPOTIFY_CLIENT_ID + SESSION_SECRET
pnpm install
pnpm dev                       # http://127.0.0.1:3000
```

You need a Spotify app (Client ID) with `http://127.0.0.1:3000/api/auth/callback` registered as
a redirect URI, and your account on its allowlist. No client secret — it's a pure PKCE flow.
**Full walkthrough (Spotify app, env vars, Railway config, troubleshooting):
[`docs/SETUP.md`](docs/SETUP.md).**

## Scripts

| Command | What |
|---|---|
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest |

## Deploy

Push to `main` → GitHub Actions CI (`install → lint → typecheck → test → build`) → Railway
auto-deploys. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md#deploy-pipeline-push-to-deploy).
