"use server";

import { revalidatePath } from "next/cache";
import type { DeckJson } from "@binarylawyer/sushi-deck/json";
import {
  generateDeck,
  type GenerateInput,
} from "@binarylawyer/sushi-deck/generate";
import { serverStore } from "@/lib/deck-api";
import { claudeLlm } from "@/lib/llm";

export async function saveDeckAction(id: string, deck: DeckJson): Promise<void> {
  await serverStore().update(id, { deck });
  revalidatePath(`/admin/${id}`);
}

export async function createDeckAction(deck: DeckJson): Promise<string> {
  const rec = await serverStore().create({ deck });
  revalidatePath("/admin");
  return rec.id;
}

export async function generateDeckAction(input: GenerateInput): Promise<string> {
  const deck = await generateDeck(input, claudeLlm());
  const rec = await serverStore().create({ deck });
  revalidatePath("/admin");
  return rec.id;
}

export async function deleteDeckAction(id: string): Promise<void> {
  await serverStore().remove(id);
  revalidatePath("/admin");
}
