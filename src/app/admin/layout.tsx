import { cookies } from "next/headers";
import {
  verifyGateCookie,
  gateCookieName,
} from "@binarylawyer/sushi-deck/gate";
import { AdminGate } from "./AdminGate";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const secret = process.env.ADMIN_GATE_SECRET;
  const configured = Boolean(secret && process.env.ADMIN_PASSWORD_HASH);
  const cookie = (await cookies()).get(gateCookieName("admin"))?.value;
  const ok = configured && verifyGateCookie(cookie, secret!);
  if (!ok) return <AdminGate configured={configured} />;
  return <>{children}</>;
}
