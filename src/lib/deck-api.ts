import { createDeckHandlers } from "@binarylawyer/sushi-deck-kit/api";
import { SupabaseDeckStore } from "@binarylawyer/sushi-deck-kit/store";
import { serviceClient } from "./supabase";
import { claudeLlm } from "./llm";

/**
 * The **backend tier**: fetch-style API handlers
 * (list/create/get/getBySlug/update/remove/generate) scoped to a tenant
 * `owner`, wired to Supabase + Claude. Mounted only by the public REST routes
 * under `src/app/api/**`; the resolved owner comes from the authenticated API
 * key, never from the client body.
 *
 * Under Option A this is the *only* place in the app that touches the database
 * or the LLM. The app's own front-end (pages + server actions) is a pure API
 * consumer — see `src/lib/deck-client.ts` — exactly like the second consumer,
 * moye-law-os. (The old in-process `serverStore()` direct-DB path was removed.)
 */
export function handlersFor(owner: string | null) {
  const store = new SupabaseDeckStore(serviceClient(), "decks", owner);
  return createDeckHandlers({ store, llm: claudeLlm() });
}
