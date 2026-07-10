import Link from "next/link";
import { getDeckClient } from "@/lib/deck-client";
import type { DeckListItem } from "@binarylawyer/sushi-deck/store";

export const dynamic = "force-dynamic";

export default async function Home() {
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
          <h1>Sushi Deck</h1>
          <div className="sub">Gallery</div>
        </div>
        <Link className="admin" href="/admin">
          Admin →
        </Link>
      </header>

      {error ? (
        <div className="notice">
          Couldn’t load decks: {error}. Set <code>SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> (see <code>.env.example</code>).
        </div>
      ) : decks.length === 0 ? (
        <div className="empty">
          No decks yet. Head to <Link href="/admin">the admin</Link> to create or
          generate one.
        </div>
      ) : (
        <div className="grid">
          {decks.map((d) => (
            <div className="card" key={d.id}>
              <h3>{d.title || "Untitled"}</h3>
              <div className="meta">
                {d.slug} · v{d.version}
              </div>
              <div className="actions">
                <Link href={`/present/${d.slug}`}>Present</Link>
                <Link href={`/scroll/${d.slug}`}>Scroll</Link>
                <Link href={`/admin/${d.id}`}>Edit</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
