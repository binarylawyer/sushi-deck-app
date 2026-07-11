"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { DeckListItem } from "@binarylawyer/sushi-deck-kit/store";
import { starterDeck } from "@/lib/starter";
import {
  createDeckAction,
  deleteDeckAction,
  generateDeckAction,
} from "./actions";

export function AdminHome({ decks }: { decks: DeckListItem[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [brief, setBrief] = useState("");
  const [title, setTitle] = useState("");
  const [genError, setGenError] = useState<string | null>(null);

  function newBlank() {
    start(async () => {
      const id = await createDeckAction(starterDeck(title || "Untitled deck"));
      router.push(`/admin/${id}`);
    });
  }

  function generate() {
    setGenError(null);
    start(async () => {
      try {
        const id = await generateDeckAction({
          brief,
          title: title || undefined,
        });
        router.push(`/admin/${id}`);
      } catch (e) {
        setGenError(e instanceof Error ? e.message : "Generation failed");
      }
    });
  }

  function remove(id: string) {
    start(async () => {
      await deleteDeckAction(id);
      router.refresh();
    });
  }

  return (
    <>
      <section
        style={{
          border: "1px solid var(--line)",
          borderRadius: 4,
          padding: 20,
          marginBottom: 32,
          background: "var(--panel)",
        }}
      >
        <div className="field">
          <label>Title (optional)</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Q3 Update"
          />
        </div>
        <div className="field">
          <label>Brief — describe the deck for AI generation</label>
          <textarea
            rows={3}
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
            placeholder="A 6-slide investor update covering growth, retention, and the Q4 ask."
          />
        </div>
        {genError ? (
          <div className="notice" style={{ marginBottom: 14 }}>
            {genError}
          </div>
        ) : null}
        <div className="row">
          <button
            className="btn"
            disabled={pending || !brief.trim()}
            onClick={generate}
          >
            {pending ? "Working…" : "Generate with AI"}
          </button>
          <button className="btn ghost" disabled={pending} onClick={newBlank}>
            New blank deck
          </button>
        </div>
      </section>

      {decks.length === 0 ? (
        <div className="empty">No decks yet.</div>
      ) : (
        <div className="grid">
          {decks.map((d) => (
            <div className="card" key={d.id}>
              <h3>{d.title || "Untitled"}</h3>
              <div className="meta">
                {d.slug} · v{d.version}
              </div>
              <div className="actions">
                <Link href={`/admin/${d.id}`}>Edit</Link>
                <Link href={`/present/${d.slug}`}>Present</Link>
                <button
                  className="del"
                  disabled={pending}
                  onClick={() => remove(d.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
