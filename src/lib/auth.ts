/**
 * API-key auth for the public REST API. Keys are configured as a JSON map of
 * { "<key>": "<owner>" } in SUSHI_DECK_API_KEYS. The resolved `owner` scopes
 * every store call — the server never trusts a client-supplied tenant.
 *
 * If no keys are configured, the public API is closed (all requests 401). The
 * admin UI does not use this path; it uses gated server actions.
 */
export interface ApiIdentity {
  owner: string | null;
}

function parseKeys(): Record<string, string> {
  const raw = process.env.SUSHI_DECK_API_KEYS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function authenticate(req: Request): ApiIdentity | null {
  const header =
    req.headers.get("authorization") ?? req.headers.get("x-api-key") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  const keys = parseKeys();
  if (Object.prototype.hasOwnProperty.call(keys, token)) {
    return { owner: keys[token] };
  }
  return null;
}

export function unauthorized(): Response {
  return new Response(JSON.stringify({ error: "unauthorized" }), {
    status: 401,
    headers: { "content-type": "application/json" },
  });
}
