"use client";

import { useState } from "react";
import { DeckEditor } from "@binarylawyer/sushi-deck-kit/editor";
import "@binarylawyer/sushi-deck-kit/styles.css";
import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";
import { saveDeckAction } from "../actions";

export function EditorClient({
  id,
  initialDeck,
}: {
  id: string;
  initialDeck: DeckJson;
}) {
  const [saving, setSaving] = useState(false);

  return (
    <DeckEditor
      initialDeck={initialDeck}
      theme={initialDeck.theme}
      saving={saving}
      onSave={async (deck) => {
        setSaving(true);
        try {
          await saveDeckAction(id, deck);
        } finally {
          setSaving(false);
        }
      }}
    />
  );
}
