# sushi-deck-app

The free-standing **Sushi Deck** product. It hosts the deck **API** (CRUD + AI
generation, backed by Supabase) and the **front-end** (gallery · present ·
scroll · print-to-PDF) plus a gated **admin** editor. It consumes the portable
[`@binarylawyer/sushi-deck`](https://github.com/binarylawyer/sushi-deck) kit —
this app is just wiring; the deck logic lives in the kit and is unit-tested
there.

It's the first of **two consumers** of one deck API: this app hosts it, and
`moye-law-os` calls it over HTTP with a service key.

```
                     ┌──────────────── sushi-deck-app (this repo) ───────────────┐
  hosts the API ▶    │  front-end:  gallery · /present · /scroll · Print→PDF      │
                     │  admin:      <DeckEditor> via gated server actions          │
                     │  API:        /api/decks (CRUD) · /api/generate              │
                     └───────────────┬───────────────────────────────┬────────────┘
                                     │ Supabase (Sushi-Kitchen)       │ Claude API
                     ┌───────────────┴──── moye-law-os (2nd consumer) ┘
   calls the API ▶   │  HTTP client with a service key; owner = firm
                     └───────────────────────────────────────────────
```

## API

All routes require an API key (`Authorization: Bearer <key>` or `x-api-key`).
Keys map to an `owner` via `SUSHI_DECK_API_KEYS`; the server never trusts a
client-supplied tenant.

| Method & path | Body | Purpose |
|---|---|---|
| `GET /api/decks` | — | List decks |
| `POST /api/decks` | `{ slug?, deck }` | Create |
| `GET /api/decks/:id` | — | Get by id |
| `PUT /api/decks/:id` | `{ deck, slug?, expectedVersion? }` | Update (optimistic lock) |
| `DELETE /api/decks/:id` | — | Delete |
| `GET /api/decks/slug/:slug` | — | Get by slug |
| `POST /api/generate` | `{ brief, title?, slides?, brand? }` | AI-generate a `DeckJson` |

Store errors map to HTTP: **422** invalid deck · **409** slug/version conflict ·
**404** not found. These handlers are `createDeckHandlers({ store, llm })` from
the kit — the exact same behavior the kit unit-tests.

## Backend

The `decks` table lives in the **Sushi-Kitchen** Supabase project
(`awomcxrkxtxwkygoschf`); migration is `supabase/migrations/0001_decks.sql` in
the kit repo. RLS is enabled with no policies, so only the **service role** can
read/write — the app is the only path to the data.

## Develop

```bash
npm install
cp .env.example .env.local   # fill in SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, gate + API keys
npm run dev
```

- Gallery: `/` · Present: `/present/<slug>` · Scroll: `/scroll/<slug>`
- Admin (password-gated): `/admin` — generate, create, edit via `<DeckEditor>`.

The admin UI writes through **gated server actions** (service role stays
server-side); the bearer-key REST API above is for programmatic consumers like
`moye-law-os`.

```bash
npm run typecheck
npm run build
```

## Notes

- The kit is source-only TypeScript, so it's listed in `transpilePackages`
  (see `next.config.mjs`).
- Tenancy: `owner` is written on create; read-isolation by owner is not yet
  enforced by the store, so all decks are visible app-wide for now.
