# Sushi Deck — System Architecture, Repos & Deployments

> **Canonical source of truth** for how the Sushi Deck product is structured:
> the repositories (and their former names), the database, the Vercel
> deployments, the env-var contract, and the two consumers. Companion to the
> library-level contract in the kit's `docs/ARCHITECTURE.md`.
>
> **Secrets rule:** this file names **env var NAMES only** — never key values.
>
> _Last updated 2026-07-11: backend live; **data-ownership boundary** codified
> (client-referencing decks stay client-side); **3-repo split** decided (§9);
> **naming sync mostly landed** — the npm package rename **landed** (kit `main` is
> now `@binarylawyer/sushi-deck-kit` v0.8.0); the **client repo + Vercel project are
> renamed to `sushi-deck-client`** (its `.vercel.app` production domain stays
> `sushi-deck-client-app.vercel.app` — Vercel does not auto-rename domains, so the
> backend URL is unchanged and no consumer env changes). Still **pending**: the kit
> **repo** rename `sushi-deck → sushi-deck-kit` (the git-install URL uses `sushi-deck.git`
> today and 301-redirects after), and the new **`sushi-deck-backend`** repo/Vercel
> project (§9)._

---

## 1. The shape — Option A (3-tier), one API, two consumers

```
                ┌──────────────────── BACKEND TIER ────────────────────┐
                │  @binarylawyer/sushi-deck-kit (store·api·generate)  │
                │  + Supabase Postgres `decks`   + Claude (LLM)          │
                │  exposes ONE HTTP API  (key-auth, owner-scoped)        │
                └───────────────┬───────────────────────┬───────────────┘
                                │ API (bearer key)       │ API (bearer key)
                    ┌───────────┴──────────┐   ┌──────────┴───────────────────┐
                    │ CONSUMER 1           │   │ CONSUMER 2                   │
                    │ sushi-deck-client    │   │ moye-law-os                  │
                    │ front-end (the       │   │ /admin/present/sushi         │
                    │ "sample client app") │   │ (embedded in the firm OS)    │
                    │ owner = "sushi-deck" │   │ owner = "moye-law-os"        │
                    └──────────────────────┘   └──────────────────────────────┘
```

- **One backend — a generic DeckJson engine.** It exposes the HTTP API (store +
  `POST /api/generate`) and owns the `decks` table + the LLM. It is meant to work
  with *any* front-end via the DeckJson spec, and it stores only **neutral /
  product** decks (demos, shared templates).
- **Consumers own their own data — especially anything client-referencing.** A
  consumer keeps decks that name its clients/matters on **its own side** and
  renders them **client-side** via `deckFromJson` — they are *never* seeded into
  the shared backend (which is co-located with the public sample client). See the
  **data-ownership boundary** below.
- **When a consumer does store in the backend**, it authenticates with a bearer
  key that resolves to an **`owner`**; the server never trusts a client-supplied
  tenant, and decks are **owner-scoped** (each consumer sees only its own). Reserve
  this for neutral/non-sensitive content.
- **Today the backend is *hosted inside* `sushi-deck-client`** (that repo plays two
  roles: it hosts the API **and** serves the "sample client" front-end). The
  decided end-state (§9) extracts it into its own repo/deploy.

### Data-ownership boundary — the rule that keeps client data off the shared backend

| | Where it lives | How it renders |
|---|---|---|
| **Neutral / product decks** (demos, shared templates) | the backend `decks` table, owner-scoped | fetched from the API |
| **Client-referencing decks** (name a firm's clients/matters) | the **consumer's own repo/DB** (e.g. `moye-law-os/src/lib/present/sushi/decks/`) | **client-side** via `deckFromJson` — never sent to the backend |

moye's `/admin/present/sushi` follows this: it lists + presents its firm decks
straight from the code registry, client-side, so matter identifiers (e.g.
`M-2026-0143`) never reach the shared table. Storing them in the shared backend —
which the public sample client also reads — would be the wrong boundary.

---

## 2. Repositories (exact names + former names)

| Repo | Role | Package / deploy name | Former name(s) |
|---|---|---|---|
| **`binarylawyer/sushi-deck-kit`** _(rename of `sushi-deck` — pending)_ | The **library / kit** — pure, testable deck logic: `runtime`, `json`, `store`, `generate`, `api`, `editor`, `gate`. Published as `@binarylawyer/sushi-deck-kit` (**v0.8.0** — renamed from `@binarylawyer/sushi-deck`). | npm pkg `@binarylawyer/sushi-deck-kit` | was **`deck-kit`**, then `sushi-deck` |
| **`binarylawyer/sushi-deck-client`** _(renamed from `sushi-deck-app` ✓; old URL redirects)_ | The **"sample" consumer front-end** (gallery/present/scroll/admin UI). Today it **still also hosts the HTTP API** (`src/app/api/**`); the backend extraction into `sushi-deck-backend` (§9) is the next change. | Vercel project **`sushi-deck-client`** (prod domain still `sushi-deck-client-app.vercel.app`) | was `sushi-deck-app` |
| **`binarylawyer/sushi-deck-backend`** _(new — planned, §9)_ | The **deployed backend API + DB service** — mounts `createDeckHandlers`, owns `decks` + Claude + future form/state. Extracted from the client-app. | Vercel project **`sushi-deck-backend`** | — |
| **`binarylawyer/moye-law-os`** | The firm OS. Its **`/admin/present/sushi`** surface is **Consumer 2**. Not part of the Sushi Deck product — it just consumes the API. | Vercel project **`moye-law-os`** | — |
| **`binarylawyer/sushi-kitchen`** | ⚠️ **Unrelated to the deck code.** A separate self-hosted infra monorepo. It only shares a *name* with the Supabase **project** ("Sushi-Kitchen") that happens to host the `decks` table. Do not look here for deck code. | — | — |

**Name gotchas to remember:**
- The kit repo rename chain is `deck-kit → sushi-deck → sushi-deck-kit`; the npm package is renamed to match (`@binarylawyer/sushi-deck-kit`, v0.8.0).
- The app repo `sushi-deck-app` is **renamed to `sushi-deck-client`** ✓, matching its Vercel project (also `sushi-deck-client`). **But the Vercel production domain stays `sushi-deck-client-app.vercel.app`** — renaming a Vercel project does *not* rename its `.vercel.app` domain, so the backend URL (and every consumer's `SUSHI_DECK_API_URL`) is unchanged. Do not "fix" the domain to match the name without adding the alias in Vercel + updating moye's env first.
- "Sushi-Kitchen" is both an (unrelated) **repo** and the **Supabase project** that stores decks. When someone says "Sushi-Kitchen" in the deck context, they mean the **Supabase project**, not the repo.

---

## 3. The library (`@binarylawyer/sushi-deck-kit`)

Pure and unit-tested; the API app and every consumer wire it to infra. Modules
(subpath exports): `.` (runtime + primitives), `./json` (DeckJson schema + ops +
`validateDeckJson`), `./store` (`DeckStore` interface + `InMemoryDeckStore` +
`SupabaseDeckStore` + shared contract), `./generate` (`generateDeck` + injected
`LlmClient`), `./api` (`createDeckHandlers`), `./editor` (`DeckEditor`), `./gate`
(password gate), `./styles.css`.

**How each consumer installs it (they differ — important):**
- `sushi-deck-client` → from **git**: `"@binarylawyer/sushi-deck-kit": "git+https://github.com/binarylawyer/sushi-deck-kit.git"` (tracks the default branch; redeploy to pull a new version). Points at the current repo name `sushi-deck-kit`.
- `moye-law-os` → **vendored tarball**: `"file:vendor/binarylawyer-sushi-deck-kit-0.9.0.tgz"` (offline, `--frozen-lockfile`) — pinned to `@binarylawyer/sushi-deck-kit@0.9.0`. The vendored copy is self-contained, so moye is unaffected by kit or repo changes until it chooses to re-vendor.

---

## 4. Database — Supabase project "Sushi-Kitchen"

- **Project:** `Sushi-Kitchen` — ref **`awomcxrkxtxwkygoschf`** — `SUPABASE_URL=https://awomcxrkxtxwkygoschf.supabase.co`.
- **Table:** `public.decks` — migration lives in the kit at `supabase/migrations/0001_decks.sql`.

```sql
decks(
  id uuid pk default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  deck jsonb not null,     -- the DeckJson
  theme jsonb,             -- optional brand overrides
  owner text,              -- app/tenant id (the consumer's owner)
  version int not null default 1,   -- optimistic concurrency
  created_at timestamptz, updated_at timestamptz
)
```

- **Access model:** RLS is **ON with no policies**, and privileges are granted to
  **`service_role` only** (added in kit migration 0001; a raw-SQL table does not
  inherit Supabase's grants, which caused the launch-day `permission denied for
  table decks [42501]`). So **only the secret/service key** can touch `decks` —
  every read/write flows through the server-side store. `anon`/`authenticated`
  have no grants.
- **Owner isolation** is enforced a second time in `SupabaseDeckStore` (kit
  ≥0.7.0): a store built with an `owner` filters every read/write to that owner.

---

## 5. Vercel deployments

- **Team:** `team_6ve0UzALDXNZffWnw2WLbHa8`
- **Backend + sample client:** project **`sushi-deck-client`** (renamed from `sushi-deck-client-app`) — `prj_HnKd31eFgMIOBpFlJz2ydRs83xIR` — production domain **`https://sushi-deck-client-app.vercel.app`** (unchanged by the rename; `sushi-deck-client.vercel.app` is *not* assigned). Deploys `binarylawyer/sushi-deck-client` `main`.
- **Consumer (firm OS):** project **`moye-law-os`** — `prj_skJHCX4n7iRGJ2edAtaySFcEGTRF` (deploys `binarylawyer/moye-law-os` `main`).
- **Deployment Protection:** **OFF** on `sushi-deck-client` (the API has its
  own key auth + the admin gate; and Option A self-calls would otherwise hit the
  SSO wall). If it's ever turned back on, both consumers can send a bypass token
  (`VERCEL_AUTOMATION_BYPASS_SECRET` → `x-vercel-protection-bypass` header).

---

## 6. Env-var contract (NAMES only)

**Backend (`sushi-deck-client`):**

| Name | Purpose |
|---|---|
| `SUPABASE_URL` | Sushi-Kitchen project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | the **Secret** key (`sb_secret_…`) — full access, bypasses RLS. NOT the publishable key, NOT a legacy JWT |
| `SUSHI_DECK_API_KEYS` | JSON map `{ "<key>": "<owner>" }` — the allow-list of consumer keys → owners |
| `SUSHI_DECK_API_KEY` | this app's own key (Option A: its front-end consumes its own API). Resolves to `SUSHI_DECK_ADMIN_OWNER` |
| `SUSHI_DECK_API_URL` | base URL the front-end calls (defaults to the deployment's own origin) |
| `SUSHI_DECK_ADMIN_OWNER` | owner the app's admin writes under (default `sushi-deck`) |
| `ADMIN_PASSWORD_HASH`, `ADMIN_GATE_SECRET` | the admin UI password gate |
| `ANTHROPIC_API_KEY` | optional — only for "Generate with AI" |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | optional — only if Deployment Protection is ON |

**Each consumer (e.g. `moye-law-os`):**

| Name | Purpose |
|---|---|
| `SUSHI_DECK_API_URL` | the backend base URL (`https://sushi-deck-client-app.vercel.app`) |
| `SUSHI_DECK_API_KEY` | the bare key matching this consumer's entry in the backend's `SUSHI_DECK_API_KEYS` (owner = the consumer) |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | optional — only if the backend keeps Deployment Protection ON |

---

## 7. API surface & auth

`createDeckHandlers({ store, llm })` (kit `./api`) mounts these under
`src/app/api/**`; every route calls `authenticate(req)` → an `owner`, and passes
it to an owner-scoped `SupabaseDeckStore`.

| Method · Path | Purpose |
|---|---|
| `GET /api/decks` | list (owner-scoped) |
| `POST /api/decks` | create `{ slug?, deck }` |
| `GET /api/decks/:id` · `GET /api/decks/slug/:slug` | fetch |
| `PUT /api/decks/:id` | update (optimistic `expectedVersion`) |
| `DELETE /api/decks/:id` | delete |
| `POST /api/generate` | brief → validated DeckJson (Claude) |
| `POST /api/admin-gate` | exchange the admin password for a session cookie (the app's own UI only) |

Errors map to JSON: `422` invalid, `409` conflict, `404` not found, `500`
`{ error, message }` (read handlers included, as of kit 0.7.1).

---

## 8. Current live state (2026-07-10)

- Backend **live and verified**: `sushi-deck-client` reads/writes `decks`;
  API returns owner-scoped results for both keys; present/scroll/PDF render.
- Seeded decks: `product-tour` (owner `sushi-deck`, a full feature showcase) and
  `moye-welcome` (owner `moye-law-os`, a neutral sample).
- Kit at **v0.7.1**. Deployment Protection OFF. Supabase grant applied.
- **moye's 5 firm decks** (estate-audit, patent onboarding, deed-stewardship,
  document-generation, fiduciary-audit) live as DeckJson in
  `moye-law-os/src/lib/present/sushi/decks/` and render **client-side** on
  `/admin/present/sushi` (moye PR #820). By design they are **not** seeded into the
  shared backend — they reference live matters (see the data-ownership boundary in
  §1). The only `moye-law-os`-owned row in the backend is the neutral
  `moye-welcome` sample.

---

## 9. Project ownership & standing principles

**Consolidated (2026-07-11):** the whole product — kit, backend, sample client,
**and** coordination of consumers (incl. moye's re-vendor + env) — is owned by a
**single conversation** now, to avoid competing changes. moye's `/admin/present/sushi`
surface is still a **consumer** of this API; changes to it are coordinated here but
its live client/matter data is never touched.

**Standing principles (non-negotiable):**
- **The 3-repo structure is followed religiously.** `sushi-deck-kit` (library) →
  `sushi-deck-backend` (API + DB service) → `sushi-deck-client` (sample front-end).
  Backend/kit code never leaks into a client; a client never forks the backend.
- **Each client owns its own design system and front-end rules.** The backend and
  kit are **presentation-neutral** — they serve DeckJson + primitives; every consumer
  (the sample client, moye, future sites) applies its **own** theme, layout, and UX.
  The backend must never impose a client's look or front-end conventions on another.
- **Data-ownership boundary (§1):** the backend stores only **neutral/product** decks.
  Any client-referencing deck stays in the consumer's own repo/DB and renders
  **client-side** — never seeded into the shared `decks` table.
- Sushi Deck work must not touch any consumer's live client data.

### Decided: extract the backend → three clean repos

The chosen end-state (replacing the "backend fused into the sample app" dual role
in §1) is **three repos**, so backend vs client is unambiguous:

| Concern | Target repo | npm package | Vercel project | Today |
|---|---|---|---|---|
| Shared library | `sushi-deck-kit` | `@binarylawyer/sushi-deck-kit` (v0.8.0) | — | `sushi-deck` |
| Backend (API service + DB) | `sushi-deck-backend` | — | `sushi-deck-backend` | fused in `sushi-deck-client` |
| Sample client (front-end) | `sushi-deck-client` | — | `sushi-deck-client` | `sushi-deck-client` (done) |

**Naming decision (2026-07-11):** all three names align across GitHub, npm, and
Vercel — including a **rename of the npm package** to `@binarylawyer/sushi-deck-kit`
(it does *not* "stay" `@binarylawyer/sushi-deck`). Consumers update their import +
install specs in lockstep; `moye-law-os` is insulated by its pinned tarball (§3).

The GitHub repo renames + the new backend repo/Vercel project are **dashboard
actions** (no MCP rename tool exists). The code work splits into two waves:

1. **Naming sync** (in progress): rename the package + all imports/install specs.
   Library PR + client-app PR are open as drafts; they merge **together** with the
   two GitHub repo renames. The API stays fused in the client-app for this wave.
2. **Backend extraction** (next): move `src/app/api/**` + store/llm/auth wiring into
   the new `sushi-deck-backend` repo, make the client a pure API consumer, and
   stand up the `sushi-deck-backend` Vercel project + env. This is also where the
   **future form/state persistence** for embedded presentations will live.
