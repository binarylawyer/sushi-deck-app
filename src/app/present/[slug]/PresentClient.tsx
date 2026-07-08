"use client";

import { DeckRuntime } from "@binarylawyer/sushi-deck";
import { deckFromJson } from "@binarylawyer/sushi-deck/json";
import type { DeckJson } from "@binarylawyer/sushi-deck/json";
import "@binarylawyer/sushi-deck/styles.css";

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
