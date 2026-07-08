import { authenticate, unauthorized } from "@/lib/auth";
import { handlersFor } from "@/lib/deck-api";

export const runtime = "nodejs";

// POST /api/generate — brief -> validated DeckJson ({ brief, title?, slides?, brand? })
export async function POST(req: Request) {
  const auth = authenticate(req);
  if (!auth) return unauthorized();
  return handlersFor(auth.owner).generate(req);
}
