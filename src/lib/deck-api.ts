import { createDeckHandlers } from "@binarylawyer/sushi-deck/api";
import { SupabaseDeckStore } from "@binarylawyer/sushi-deck/store";
import { serviceClient } from "./supabase";
import { claudeLlm } from "./llm";

const ADMIN_OWNER = process.env.SUSHI_DECK_ADMIN_OWNER ?? "sushi-deck";

/**
 * Fetch-style API handlers (list/create/get/getBySlug/update/remove/generate)
 * scoped to a tenant `owner`. Mounted by the public REST routes; the resolved
 * owner comes from the authenticated API key, never from the client body.
 */
export function handlersFor(owner: string | null) {
  const store = new SupabaseDeckStore(serviceClient(), "decks", owner);
  return createDeckHandlers({ store, llm: claudeLlm() });
}

/**
 * Direct store for the standalone app's own server components / server actions
 * (in-process, no self-HTTP). Same DB + same behavior as the hosted API.
 */
export function serverStore(owner: string | null = ADMIN_OWNER) {
  return new SupabaseDeckStore(serviceClient(), "decks", owner);
}
