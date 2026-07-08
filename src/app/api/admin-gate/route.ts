import { cookies } from "next/headers";
import {
  verifyPassword,
  signGateCookie,
  gateCookieName,
} from "@binarylawyer/sushi-deck/gate";

export const runtime = "nodejs";

const COOKIE = gateCookieName("admin");

// POST /api/admin-gate — exchange the admin password for a signed session cookie.
export async function POST(req: Request) {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  const secret = process.env.ADMIN_GATE_SECRET;
  if (!hash || !secret) {
    return Response.json({ ok: false, error: "gate_not_configured" }, { status: 500 });
  }
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (!password || !verifyPassword(password, hash)) {
    return Response.json({ ok: false }, { status: 401 });
  }
  (await cookies()).set(COOKIE, signGateCookie(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });
  return Response.json({ ok: true });
}
