import Link from "next/link";
import { serverStore } from "@/lib/deck-api";
import type { DeckListItem } from "@binarylawyer/sushi-deck/store";
import { AdminHome } from "./AdminHome";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let decks: DeckListItem[] = [];
  let error: string | null = null;
  try {
    decks = await serverStore().list();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to load decks";
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
