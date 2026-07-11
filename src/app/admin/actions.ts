"use server";

import { revalidatePath } from "next/cache";
import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";
import type { GenerateInput } from "@binarylawyer/sushi-deck-kit/generate";
import { getDeckClient, type DeckApiClient } from "@/lib/deck-client";

/**
 * Server actions for the app's own admin. Under Option A they call the deck
 * **API** over HTTP (like any consumer) rather than the database directly — so
 * generation, persistence, and tenancy all flow through the one backend tier.
 */
function requireClient(): DeckApiClient {
  const client = getDeckClient();
  if (!client) {
    throw new Error(
      "Sushi Deck API is not configured (set SUSHI_DECK_API_URL and SUSHI_DECK_API_KEY).",
    );
  }
  return client;
}

export async function saveDeckAction(id: string, deck: DeckJson): Promise<void> {
  await requireClient().update(id, deck);
  revalidatePath(`/admin/${id}`);
}

export async function createDeckAction(deck: DeckJson): Promise<string> {
  const rec = await requireClient().create(deck);
  revalidatePath("/admin");
  return rec.id;
}

export async function generateDeckAction(input: GenerateInput): Promise<string> {
  const client = requireClient();
  const deck = await client.generate(input);
  const rec = await client.create(deck);
  revalidatePath("/admin");
  return rec.id;
}

export async function deleteDeckAction(id: string): Promise<void> {
  await requireClient().remove(id);
  revalidatePath("/admin");
}
