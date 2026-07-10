# Kickoff — dedicated Sushi Deck (product) conversation

Paste the block below to start the **standalone Sushi Deck** conversation. It
owns the product (kit + backend + sample client) and treats moye-law-os as an
external consumer. Full detail lives in `docs/ARCHITECTURE.md` (read it first).

---

```
# Sushi Deck — standalone product (backend + kit + sample client)

You own the **Sushi Deck** product as its own project, split out of moye-law-os.
It is a portable, API-driven presentation/slide-deck builder: one HTTP API
(Supabase `decks` + Claude) with front-ends as pure, owner-scoped API consumers.

## Bring the repos into scope (clone each inline, one at a time, generous timeout)
- add_repo binarylawyer/sushi-deck        # the kit/library @binarylawyer/sushi-deck (v0.7.1)
- add_repo binarylawyer/sushi-deck-app    # the backend tier + the "sample client" front-end

Do NOT work in moye-law-os here — that's a separate conversation. moye is only a
*consumer* of this API; never touch its live client data.

## Read first (source of truth)
- sushi-deck-app `docs/ARCHITECTURE.md` — repos (+ former names), the Supabase
  project, the Vercel projects, the env-var contract, the two consumers, and the
  current live state. THIS IS THE SPEC.
- sushi-deck-app `docs/PROJECT.md`-adjacent: `README.md`, `.env.example`,
  `src/app/api/**`, `src/lib/{deck-api,deck-client,auth,supabase,llm}.ts`.
- kit `docs/ARCHITECTURE.md`, `src/{store,api,generate,json}`,
  `supabase/migrations/0001_decks.sql`.

## Reference facts (names only — never print secret values)
- Supabase project "Sushi-Kitchen" `awomcxrkxtxwkygoschf`;
  `SUPABASE_URL=https://awomcxrkxtxwkygoschf.supabase.co`; table `public.decks`
  (RLS on, granted to service_role only).
- Vercel team `team_6ve0UzALDXNZffWnw2WLbHa8`; backend project
  `sushi-deck-client-app` `prj_HnKd31eFgMIOBpFlJz2ydRs83xIR`
  (`https://sushi-deck-client-app.vercel.app`). NOTE: repo `sushi-deck-app`
  deploys as Vercel project `sushi-deck-client-app` (name mismatch).
- Kit repo was renamed `deck-kit → sushi-deck`. The repo `binarylawyer/sushi-kitchen`
  is an UNRELATED infra monorepo — not deck code; it only shares a name with the
  Supabase project.

## Current state (working — do not re-litigate)
- Backend is LIVE: reads/writes `decks`, owner-scoped API, present/scroll/PDF all
  verified. Deployment Protection OFF. Supabase grant applied. Kit v0.7.1.
- Seeded: `product-tour` (owner `sushi-deck`, feature showcase) and `moye-welcome`
  (owner `moye-law-os`).
- Consumers: sushi-deck-app's own front-end (owner `sushi-deck`) and moye-law-os
  `/admin/present/sushi` (owner `moye-law-os`).
- moye's firm decks render CLIENT-SIDE from its own code registry (data-ownership
  boundary) — they are NOT in the backend; only the neutral `moye-welcome` sample
  is stored under owner `moye-law-os`.

## Candidate next work (confirm priorities first)
1. **Execute the decided 3-repo split (ARCHITECTURE §9):** extract the backend
   (`src/app/api/**` + store/llm wiring) into a `sushi-deck-backend` repo with its
   own Vercel project; rename `sushi-deck-app → sushi-deck-client` and
   `sushi-deck → sushi-deck-kit` (npm name stays `@binarylawyer/sushi-deck`). Repo
   + Vercel renames are the owner's dashboard actions; the code split is yours.
2. Editor / authoring UX in the sample client; asset/image storage.
3. Generation model + cost ceiling; rate-limiting; per-user (vs per-app) tenancy.
4. Release/versioning: publish the kit properly; keep consumers' installs current
   (sushi-deck-app tracks git main; other consumers vendor a tarball).

## Guardrails
- Env var NAMES only in chat/docs/commits — never secret values.
- Develop on a feature branch per repo; open draft PRs.
- **Data-ownership boundary:** the backend stores only NEUTRAL/product decks. Any
  client-referencing deck stays in the consumer's own repo/DB and renders
  client-side — never seed such decks into the shared `decks` table.
- moye-law-os is out of scope here (it's the other conversation); don't fork the
  backend into it — it consumes the API.
```

---

_Meanwhile, the **moye-law-os** conversation keeps the consumer side: the
`/admin/present/sushi` surface renders the firm's decks **client-side** from its
own code registry — they are NOT seeded into the shared backend, because they
reference live matters._
