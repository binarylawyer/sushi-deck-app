"use client";

import { DeckRuntime } from "@binarylawyer/sushi-deck-kit";
import { deckFromJson } from "@binarylawyer/sushi-deck-kit/json";
import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";
import "@binarylawyer/sushi-deck-kit/styles.css";

export function PresentClient({ deck, slug }: { deck: DeckJson; slug: string }) {
  return (
    <DeckRuntime
      deck={deckFromJson(deck)}
      homeHref="/"
      scrollHref={`/scroll/${slug}`}
      theme={deck.theme}
    />
  );
}
