import { authenticate, unauthorized } from "@/lib/auth";
import { handlersFor } from "@/lib/deck-api";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ slug: string }> };

// GET /api/decks/slug/:slug
export async function GET(req: Request, { params }: Ctx) {
  const auth = authenticate(req);
  if (!auth) return unauthorized();
  const { slug } = await params;
  return handlersFor(auth.owner).getBySlug(req, { slug });
}
