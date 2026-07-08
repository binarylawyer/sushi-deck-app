import { authenticate, unauthorized } from "@/lib/auth";
import { handlersFor } from "@/lib/deck-api";

export const runtime = "nodejs";

// GET /api/decks — list decks for the authenticated owner
export async function GET(req: Request) {
  const id = authenticate(req);
  if (!id) return unauthorized();
  return handlersFor(id.owner).list(req);
}

// POST /api/decks — create a deck ({ slug?, deck })
export async function POST(req: Request) {
  const id = authenticate(req);
  if (!id) return unauthorized();
  return handlersFor(id.owner).create(req);
}
