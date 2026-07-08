# Architecture

A retro-receipt view of your Spotify listening stats. This document describes how the app is
built, how authentication works, and how it ships — the diagrams render natively on GitHub.

> **Status:** Phase 0 (walking skeleton + live OAuth). The stats dashboard, design system,
> and shareable-image export land in later phases. See the roadmap at the end.

---

## Stack at a glance

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + React 19** | One deployable unit that does secure server-side token handling *and* the visual frontend. |
| Language | TypeScript | — |
| Styling | Tailwind v4 | Fast iteration toward the receipt design system. |
| Sessions | **iron-session** | Encrypted, httpOnly cookie — no datastore needed, tokens never reach client JS. |
| Package manager | **pnpm 10.25** (pinned via `packageManager`) | Fast, strict, reproducible. |
| Runtime | **Node 24** (pinned via `.nvmrc` + `engines`) | Local == CI == Railway. |
| Tests | Vitest + Testing Library | Lightweight, no Babel config. |
| CI | GitHub Actions | `install → lint → typecheck → test → build` on every push/PR. |
| Hosting | **Railway** (push-to-deploy) | Auto-deploys `main`; Nixpacks detects pnpm + Node. |

---

## System architecture

Everything Spotify-facing lives in `lib/`; the `app/` files are thin and orchestrate. The
browser only ever holds an **encrypted** session cookie — never a Spotify token.

```mermaid
flowchart LR
  subgraph Client["Browser"]
    UI["Landing / Dashboard pages"]
    Cookie["spotify_receipt_session<br/>(encrypted, httpOnly)"]
  end
  subgraph Server["Next.js on Railway"]
    SC["Server Components<br/>(dashboard/page.tsx)"]
    RH["Route Handlers<br/>/api/auth/*, /api/probe"]
    LIB["lib/: env, session, spotify"]
  end
  Spotify["Spotify Web API<br/>accounts + api.spotify.com"]

  UI -->|click login| RH
  RH -->|read / write| Cookie
  SC -->|read| Cookie
  RH --> LIB
  SC --> LIB
  LIB -->|OAuth + data| Spotify
```

---

## Authentication — Authorization Code + PKCE

We use the **Authorization Code flow with PKCE**, handled entirely server-side. There are two
parties that matter — *your server* and *Spotify's accounts server* — and the browser is just a
courier between them.

```mermaid
sequenceDiagram
  actor U as User (Browser)
  participant A as App Server (Next.js)
  participant S as Spotify

  U->>A: GET /api/auth/login
  A->>A: make code_verifier + code_challenge + state
  A->>A: save verifier and state in session cookie
  A-->>U: 302 to Spotify /authorize (client_id, challenge, state, scopes)
  U->>S: authorize + consent
  S-->>U: 302 /api/auth/callback?code and state
  U->>A: GET /api/auth/callback?code and state
  A->>A: verify state == session.oauthState
  A->>S: POST /api/token (code, code_verifier)
  S->>S: check sha256(verifier) == challenge
  S-->>A: access_token, refresh_token, expires_in
  A->>A: store tokens in session, clear verifier/state
  A-->>U: 302 to /dashboard
```

**The PKCE payoff:** at `/login` we generate a random `code_verifier` (kept server-side) and
send only its SHA-256 hash (`code_challenge`) to Spotify. At the token exchange we present the
verifier; Spotify re-hashes it and checks it matches the challenge. So even if the one-time
`code` in the redirect is intercepted, it's useless without the verifier — which never left the
server. This replaces the old shared-client-secret model with per-transaction proof; **we use
no client secret at all.**

Relevant code: `src/lib/spotify.ts` (`generateCodeVerifier`, `codeChallenge`,
`buildAuthorizeUrl`, `exchangeCodeForTokens`), `src/app/api/auth/login/route.ts`,
`src/app/api/auth/callback/route.ts`.

---

## Sessions & token refresh

**iron-session** is a *stateless* session library: instead of a session ID pointing at a
server-side store, the entire payload (`accessToken`, `refreshToken`, `expiresAt`, plus the
transient PKCE `codeVerifier`/`oauthState`) is serialized, **AES-encrypted**, **HMAC-signed**
with `SESSION_SECRET`, and stored in one cookie. That gives us:

- **Confidentiality** — the cookie is ciphertext; only the server can decrypt it. Combined with
  `httpOnly`, client JS (and XSS) can't read tokens.
- **Integrity** — tamper with a byte and the HMAC check fails; the session is rejected.
- **No datastore** — scales trivially. Trade-off: no instant server-side revocation before
  expiry (fine here — Spotify tokens self-expire; we can move sessions into Postgres in a later
  phase if needed). Config: `src/lib/session.ts`.

Access tokens last ~1 hour. A **Next.js constraint** shapes the refresh design: cookies can only
be written from Route Handlers / Server Actions, **never from a Server Component**. So the
dashboard (a Server Component) can't refresh-and-save itself — it bounces to a Route Handler.

```mermaid
flowchart TD
  D["/dashboard (Server Component)"] --> Q{"session.accessToken?"}
  Q -->|no| L["redirect /api/auth/login"]
  Q -->|yes| E{"needsRefresh?<br/>expired or under 30s left"}
  E -->|yes| R["redirect /api/auth/refresh"]
  E -->|no| F["spotifyGet /me/top/artists"]
  R --> RH["refresh route handler"]
  RH --> SP["POST /api/token (refresh_token)"]
  SP --> SAVE["save new tokens<br/>(cookie write allowed here)"]
  SAVE --> D
  F --> V["render receipt"]
```

`needsRefresh()` is a plain function in `src/lib/session.ts` (kept out of the component to
satisfy React Compiler's purity rule). If seamless per-request refresh is ever needed, the usual
upgrade is `middleware.ts`, which *can* set cookies on the response.

---

## Why both `state` and PKCE?

They defend **different** attacks — neither makes the other redundant, which is why OAuth 2.1
recommends both.

| | `state` | PKCE |
|---|---|---|
| Threat stopped | Login CSRF / forged callback | Stolen/intercepted authorization `code` |
| Protects | the **callback response** | the **token exchange** |
| Binds the flow to… | the **browser session** | the **client that started it** |
| Mechanism | random value stored in session, echoed back, compared | `sha256(verifier) == challenge` proof-of-possession |

- **`state`** answers: *"is this callback for the flow this browser actually started?"* Without
  it, an attacker could trick your logged-in user into completing a flow bound to the
  *attacker's* account (login CSRF).
- **PKCE** answers: *"can whoever redeems this code prove they started the flow?"* Without it, a
  leaked `code` (redirect URLs show up in history, logs, `Referer`) could be redeemed by an
  attacker.

---

## Data layer & caching (Phase 1)

All music data is read through a **`MusicDataSource`** interface (`src/lib/musicData.ts`), so the
underlying provider stays swappable. The only implementation today is Spotify
(`createSpotifyDataSource`).

Stats are cached with the **Next.js Data Cache** (`unstable_cache`) — no database needed:

- **Per-user keys** — entries are keyed by `["top-artists", userId, range]` etc., so users never
  see each other's data.
- **Token as a closure, not a key** — the access token is captured inside the cached function,
  not part of the cache key, so the hourly token refresh doesn't bust the cache. The token is
  only used on a miss.
- **TTL + tag** — top stats revalidate after 1h, recently-played after 5m; all tagged
  `stats:<userId>`.
- **Manual refresh** — `GET /api/stats/refresh` calls `revalidateTag("stats:<userId>", { expire: 0 })`
  (Next 16 requires the profile arg) to purge that user's stats on demand, then bounces back.

```mermaid
flowchart LR
  Page["/dashboard?range=..."] --> DS["MusicDataSource<br/>per-user, per-range"]
  DS --> C{"cached?<br/>tag stats:userId"}
  C -->|hit| Ret["return cached stats"]
  C -->|miss| F["fetch Spotify (no-store)"]
  F --> Store["store under tag, TTL 1h"]
  Store --> Ret
  Refresh["/api/stats/refresh"] -->|revalidateTag| C
```

The dashboard (`src/app/dashboard/page.tsx`) is a Server Component that reads the range from
`?range=` (`short_term` / `medium_term` / `long_term`), fetches top artists + top tracks in
parallel, derives a genre breakdown (`topGenres`), and renders them receipt-style.

> **Shape safety:** Spotify responses have optional/missing fields (e.g. an artist may have no
> `genres`). Defaults are applied at the `MusicDataSource` mapping boundary so a missing field
> can't crash a render.

---

## Deploy pipeline (push-to-deploy)

No Railway CLI in the loop — `git push main` is the deploy trigger, gated by CI.

```mermaid
flowchart LR
  Dev["Local dev<br/>pnpm dev"] -->|git push main| GH["GitHub"]
  GH --> CI["GitHub Actions CI<br/>install - lint - typecheck - test - build"]
  CI -->|green| RW["Railway<br/>Nixpacks build + deploy"]
  CI -->|red| X["deploy blocked<br/>Wait for CI"]
  RW --> URL["spotify-analyse-production<br/>.up.railway.app"]
```

Railway's **Wait for CI** setting holds the deploy until the GitHub Actions check passes, so a
red build never ships. CI config: `.github/workflows/ci.yml`.

---

## File map

```
src/
  lib/
    env.ts          # lazy env access (client id, redirect uri, session secret, base url)
    session.ts      # iron-session config; getSession(); needsRefresh(); userId/displayName
    spotify.ts      # PKCE helpers, token exchange/refresh, API fetch, SCOPES
    musicData.ts    # MusicDataSource (top artists/tracks, recently-played; cached) + topGenres/decadeBreakdown
  app/
    page.tsx        # landing — "LOG IN WITH SPOTIFY"
    dashboard/page.tsx     # protected Server Component — top artists/tracks, genres, range toggle
    api/
      auth/login/route.ts     # start the OAuth handshake
      auth/callback/route.ts  # verify state, exchange code, store tokens + identity
      auth/refresh/route.ts   # renew an expired access token
      auth/logout/route.ts    # destroy the session
      stats/refresh/route.ts  # purge the user's cached stats (revalidateTag)
      probe/route.ts          # record which endpoints return 200 vs 403
.env.example        # required env vars (PKCE — no client secret)
```

---

## Spotify API reality (verified 2026)

New apps are heavily restricted, and the plan is built around what actually works:

- **Permanently 403 for new apps:** audio-features, audio-analysis, recommendations,
  related-artists, editorial/featured playlists (Nov 2024).
- **Development mode:** max **5 allowlisted users**, and the **app owner must have Spotify
  Premium** (Feb 2026). No public signups.
- **Extended quota** (which would lift these) is org-only and unreachable for a portfolio app.

`/api/probe` empirically records the live status of each endpoint for *this* app. Results for a
client ID created **2026-07-08**:

| Endpoint | Status | Use |
|---|---|---|
| `GET /me` (profile) | ✅ 200 | user identity |
| `GET /me/top/artists` (3 time ranges) | ✅ 200 | top artists |
| `GET /me/top/tracks` (3 time ranges) | ✅ 200 | top tracks |
| `GET /me/player/recently-played` | ✅ 200 | recently played |
| `GET /me/tracks` (saved) | ✅ 200 | library insights |
| `GET /me/playlists` | ✅ 200 | playlist analysis |
| `GET /audio-features/{id}` | ❌ 403 | dead — mood/energy unavailable |
| `GET /recommendations` | ❌ 404 | dead — recommendations unavailable |

Every endpoint the plan needs (Option A, stats-only) returns 200; the two dead ones confirm the
excluded features. All external data sits behind a `MusicDataSource` interface (introduced in
Phase 1) so the source is swappable.

---

## Roadmap

- **Phase 0 ✅** — walking skeleton, live OAuth (PKCE), endpoint probe.
- **Phase 1 ✅** — core stats dashboard: top tracks/artists (3 ranges), genre breakdown,
  recently-played, decade mix, per-user caching.
- **Phase 2** — retro-receipt design system.
- **Phase 3** — shareable receipt image (the viral mechanic).
- **Phase 4** — playlist analysis.
