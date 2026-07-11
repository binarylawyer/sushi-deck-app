import "server-only";

import type { DeckJson } from "@binarylawyer/sushi-deck-kit/json";
import type { StoredDeck, DeckListItem } from "@binarylawyer/sushi-deck-kit/store";
import type { GenerateInput } from "@binarylawyer/sushi-deck-kit/generate";

/**
 * Server-side client for the Sushi Deck HTTP API.
 *
 * Under the decided Option-A architecture this app is a **pure front-end
 * consumer** of the one deck API — its pages and server actions no longer touch
 * Supabase or the LLM directly (that was the old in-process `serverStore()`
 * path). This app *hosts* that API (see `src/app/api/**`), so by default the
 * client points back at this same deployment; it consumes the API exactly the
 * way the second consumer (moye-law-os) does — over HTTP, with a bearer key
 * that resolves to an `owner`.
 *
 * Config (server-only env; never reaches the browser):
 *   SUSHI_DECK_API_URL   base URL of the API. Defaults to this deployment's own
 *                        origin (VERCEL_PROJECT_PRODUCTION_URL / VERCEL_URL),
 *                        then http://localhost:3000 for local dev.
 *   SUSHI_DECK_API_KEY   bare key matching a SUSHI_DECK_API_KEYS entry. For this
 *                        app's own admin, point it at a key whose owner is the
 *                        app's admin owner (SUSHI_DECK_ADMIN_OWNER).
 *   VERCEL_AUTOMATION_BYPASS_SECRET  optional — if Vercel Deployment Protection
 *                        is left ON, this is sent as the protection-bypass
 *                        header so same-origin/server-to-server calls aren't
 *                        bounced to the SSO wall. No-op if unset.
 *
 * Returns `null` when no API key is configured, so the feature degrades
 * gracefully (the gallery shows a "configure the API" notice) instead of
 * crashing — the same null-when-unconfigured pattern moye-law-os uses.
 */
export interface DeckApiClient {
  list(): Promise<DeckListItem[]>;
  get(id: string): Promise<StoredDeck | null>;
  getBySlug(slug: string): Promise<StoredDeck | null>;
  create(deck: DeckJson): Promise<StoredDeck>;
  update(id: string, deck: DeckJson): Promise<StoredDeck>;
  remove(id: string): Promise<void>;
  generate(input: GenerateInput): Promise<DeckJson>;
}

function resolveBaseUrl(): string | null {
  const explicit = process.env.SUSHI_DECK_API_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() || process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  if (process.env.NODE_ENV !== "production") return "http://localhost:3000";
  return null;
}

export function getDeckClient(): DeckApiClient | null {
  const base = resolveBaseUrl();
  const key = process.env.SUSHI_DECK_API_KEY?.trim();
  if (!base || !key) return null;

  const bypass = process.env.VERCEL_AUTOMATION_BYPASS_SECRET?.trim();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
  if (bypass) headers["x-vercel-protection-bypass"] = bypass;

  /**
   * Surface the *real* failure. The API maps store/Supabase errors to a JSON
   * body (`{ error, message, errors }`); include it in the thrown Error so the
   * actual cause (e.g. "decks.list failed: JWT expired [PGRST301]") reaches the
   * UI instead of a swallowed generic string.
   */
  async function detail(res: Response): Promise<string> {
    try {
      const body = (await res.json()) as { message?: string; error?: string; errors?: unknown };
      const msg = body.message || body.error || "";
      const extra = body.errors ? ` ${JSON.stringify(body.errors)}` : "";
      return msg ? `${res.status} ${msg}${extra}` : `${res.status}`;
    } catch {
      return `${res.status}`;
    }
  }

  async function req<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${base}${path}`, { ...init, headers, cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Sushi Deck API ${init?.method ?? "GET"} ${path} → ${await detail(res)}`);
    }
    return (await res.json()) as T;
  }

  async function maybe<T>(path: string): Promise<T | null> {
    const res = await fetch(`${base}${path}`, { headers, cache: "no-store" });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`Sushi Deck API GET ${path} → ${await detail(res)}`);
    return (await res.json()) as T;
  }

  return {
    list: () => req<DeckListItem[]>("/api/decks"),
    get: (id) => maybe<StoredDeck>(`/api/decks/${encodeURIComponent(id)}`),
    getBySlug: (slug) => maybe<StoredDeck>(`/api/decks/slug/${encodeURIComponent(slug)}`),
    create: (deck) => req<StoredDeck>("/api/decks", { method: "POST", body: JSON.stringify({ deck }) }),
    update: (id, deck) =>
      req<StoredDeck>(`/api/decks/${encodeURIComponent(id)}`, {
        method: "PUT",
        body: JSON.stringify({ deck }),
      }),
    async remove(id) {
      const res = await fetch(`${base}/api/decks/${encodeURIComponent(id)}`, {
        method: "DELETE",
        headers,
        cache: "no-store",
      });
      if (!res.ok && res.status !== 404) {
        throw new Error(`Sushi Deck API DELETE /api/decks/${id} → ${await detail(res)}`);
      }
    },
    generate: (input) => req<DeckJson>("/api/generate", { method: "POST", body: JSON.stringify(input) }),
  };
}
