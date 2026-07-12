import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";

/** A minimal starter deck for "New blank deck". */
export function starterDeck(title = "Untitled deck"): DeckJson {
  return {
    v: 1,
    title,
    slides: [
      {
        id: "cover",
        kind: "cover",
        label: "Cover",
        eyebrow: "Draft",
        title,
      },
      {
        id: "one",
        kind: "slide",
        label: "Section",
        blocks: [
          { block: "opener", eyebrow: "Section", headline: "Your first *slide*" },
          { block: "paragraph", text: "Edit this in the inspector on the right." },
        ],
      },
    ],
  };
}
