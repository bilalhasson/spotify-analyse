# Setup

How to get the app running locally and configured on Railway. For how it works, see
[`ARCHITECTURE.md`](ARCHITECTURE.md).

## Prerequisites

- **Node 24** and **pnpm 10.25** (pinned in `.nvmrc` / `package.json` → use `nvm use` + `corepack enable`).
- A **Spotify account with Premium** — required to *own* a development-mode app (Spotify policy, Feb 2026).

## Environment variables

Three values, each from a different source. **No client secret** is needed — this is a pure PKCE flow.

| Variable | Where it comes from | Example |
|---|---|---|
| `SPOTIFY_CLIENT_ID` | Spotify Developer Dashboard (step 1) | `a1b2c3...` |
| `SPOTIFY_REDIRECT_URI` | You define it; must match a URI registered in the dashboard | see below |
| `SESSION_SECRET` | You generate it (`openssl rand -base64 32`) | `RsutmwXW...=` |

`SPOTIFY_REDIRECT_URI` differs per environment:
- **Local:** `http://127.0.0.1:3000/api/auth/callback` (Spotify requires the loopback IP `127.0.0.1`, **not** `localhost`)
- **Production:** `https://spotify-analyse-production.up.railway.app/api/auth/callback`

---

## Step 1 — Create the Spotify app

1. Go to **https://developer.spotify.com/dashboard** and log in.
2. **Create app**. Set:
   - **Name / description:** anything.
   - **Redirect URIs:** add **both** the local and production URIs above.
   - **APIs/SDKs:** tick **Web API**.
3. Save → open the app → **Settings** → copy the **Client ID**.
4. **User Management** → add the email of every Spotify account that will log in (max **5**; each must be added before it can authenticate).

## Step 2 — Run locally

```bash
nvm use            # Node 24 (from .nvmrc)
corepack enable    # pnpm from packageManager pin
cp .env.example .env.local
# edit .env.local: set SPOTIFY_CLIENT_ID and SESSION_SECRET
# (SPOTIFY_REDIRECT_URI is already the 127.0.0.1 value)
pnpm install
pnpm dev           # http://127.0.0.1:3000
```

`.env.local` is git-ignored. Generate a secret with `openssl rand -base64 32`.

## Step 3 — Configure Railway (production)

Deployment is push-to-deploy (see [pipeline](ARCHITECTURE.md#deploy-pipeline-push-to-deploy)); you only set config once.

1. **Variables** tab → add:
   ```
   SPOTIFY_CLIENT_ID=<your client id>
   SPOTIFY_REDIRECT_URI=https://spotify-analyse-production.up.railway.app/api/auth/callback
   SESSION_SECRET=<32+ char random string>
   ```
   Saving triggers a redeploy.
2. **Settings → Networking → Generate Domain**, target port **3000** (or set a `PORT=3000` variable to be explicit).
3. **Settings → enable "Wait for CI"** so a red build never deploys.

## Verify

Run the Phase 0 test checklist:

1. Open the live URL → **LOG IN WITH SPOTIFY** → approve → land on `/dashboard` with your real top 5 artists.
2. DevTools → Application → Cookies: `spotify_receipt_session` is **HttpOnly** and its value is opaque (encrypted).
3. Visit `/api/probe` → JSON of each endpoint's `200`/`403` status.
4. Log out → `/dashboard` redirects to login.

## Troubleshooting

| Symptom | Likely cause / fix |
|---|---|
| **502 / "Application failed to respond"** | Port mismatch — set Railway `PORT=3000` and domain target port 3000 |
| **INVALID_CLIENT** / redirect error on Spotify | `SPOTIFY_REDIRECT_URI` doesn't *exactly* match a URI registered in the dashboard (trailing slash, http vs https, `localhost` vs `127.0.0.1`) |
| Redirected to `/?error=invalid_state` | Cookie not persisting — usually `SESSION_SECRET` missing or under 32 chars |
| Consent screen appears, then **403** | Account not on the app allowlist, or not Premium |
| `/api/probe` returns `401` | Not logged in — complete the login first |
