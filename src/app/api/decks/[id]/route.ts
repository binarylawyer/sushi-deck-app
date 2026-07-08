import { authenticate, unauthorized } from "@/lib/auth";
import { handlersFor } from "@/lib/deck-api";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

// GET /api/decks/:id
export async function GET(req: Request, { params }: Ctx) {
  const auth = authenticate(req);
  if (!auth) return unauthorized();
  const { id } = await params;
  return handlersFor(auth.owner).get(req, { id });
}

// PUT /api/decks/:id — update ({ deck, slug?, expectedVersion? })
export async function PUT(req: Request, { params }: Ctx) {
  const auth = authenticate(req);
  if (!auth) return unauthorized();
  const { id } = await params;
  return handlersFor(auth.owner).update(req, { id });
}

// DELETE /api/decks/:id
export async function DELETE(req: Request, { params }: Ctx) {
  const auth = authenticate(req);
  if (!auth) return unauthorized();
  const { id } = await params;
  return handlersFor(auth.owner).remove(req, { id });
}
