import Link from "next/link";
import { getDeckClient } from "@/lib/deck-client";
import type { DeckListItem } from "@binarylawyer/sushi-deck/store";
import { AdminHome } from "./AdminHome";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const client = getDeckClient();
  let decks: DeckListItem[] = [];
  let error: string | null = null;
  if (!client) {
    error = "The deck API isn't configured (set SUSHI_DECK_API_URL and SUSHI_DECK_API_KEY).";
  } else {
    try {
      decks = await client.list();
    } catch (e) {
      error = e instanceof Error ? e.message : `Failed to load decks: ${String(e)}`;
    }
  }

  return (
    <main className="wrap">
      <header className="masthead">
        <div>
          <h1>Sushi Deck · Admin</h1>
          <div className="sub">Create, generate, and edit decks</div>
        </div>
        <Link className="admin" href="/">
          ← Gallery
        </Link>
      </header>

      {error ? (
        <div className="notice">
          Couldn’t load decks: {error}. Check your Supabase env vars.
        </div>
      ) : (
        <AdminHome decks={decks} />
      )}
    </main>
  );
}
