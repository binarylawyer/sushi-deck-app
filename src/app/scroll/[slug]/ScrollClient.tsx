"use client";

import { ScrollView } from "@binarylawyer/sushi-deck-kit";
import { deckFromJson } from "@binarylawyer/sushi-deck-kit/json";
import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";
import "@binarylawyer/sushi-deck-kit/styles.css";

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
