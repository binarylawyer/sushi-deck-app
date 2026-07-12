"use client";

import { ScrollView } from "@binarylawyer/sushi-deck";
import { deckFromJson } from "@binarylawyer/sushi-deck/json";
import type { DeckJson } from "@binarylawyer/sushi-deck/json";
import "@binarylawyer/sushi-deck/styles.css";

export function ScrollClient({ deck, slug }: { deck: DeckJson; slug: string }) {
  return (
    <ScrollView
      deck={deckFromJson(deck)}
      presentHref={`/present/${slug}`}
      homeHref="/"
      theme={deck.theme}
    />
  );
}
