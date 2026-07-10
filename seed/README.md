# Seed decks

Neutral **sample** `DeckJson` files (no client data) so the backend has
something to present on day one. Both are already inserted into the
Sushi-Kitchen `decks` table:

| File | Slug | Owner | Surface that lists it |
|---|---|---|---|
| `product-tour.json` | `product-tour` | `sushi-deck` | the standalone app's gallery |
| `moye-welcome.json` | `moye-welcome` | `moye-law-os` | moye's `/admin/present/sushi` |

Each row is **owner-scoped**: a consumer only ever lists its own decks (enforced
by `SupabaseDeckStore` as of kit v0.7.0 and, later, by Postgres RLS).

## Re-seeding

**The Option-A way (through the API).** POST a file with a bearer key whose
`owner` matches the intended tenant — the server sets `owner` from the key, never
from the body:

```bash
curl -sS -X POST "$SUSHI_DECK_API_URL/api/decks" \
  -H "Authorization: Bearer $SUSHI_DECK_API_KEY" \
  -H "Content-Type: application/json" \
  --data "{\"deck\": $(cat seed/product-tour.json)}"
```

(Use the key that resolves to `sushi-deck` for `product-tour.json`, and the key
that resolves to `moye-law-os` for `moye-welcome.json`.)

**Direct SQL** (service/secret key) is also fine for a one-off — insert into
`public.decks (slug, title, deck, owner)`; `on conflict (slug) do update` makes
it idempotent.
