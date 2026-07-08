import Link from "next/link";
import { notFound } from "next/navigation";
import { serverStore } from "@/lib/deck-api";
import { EditorClient } from "./EditorClient";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export default async function EditDeckPage({ params }: Ctx) {
  const { id } = await params;
  const rec = await serverStore().get(id);
  if (!rec) notFound();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          padding: "10px 18px",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg)",
          fontSize: 13,
        }}
      >
        <Link href="/admin" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
          ← Admin
        </Link>
        <span style={{ color: "var(--muted)" }}>
          {rec.slug} · v{rec.version}
        </span>
        <Link
          href={`/present/${rec.slug}`}
          style={{ color: "var(--muted)", textDecoration: "none", marginLeft: "auto" }}
        >
          Present ↗
        </Link>
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>
        <EditorClient id={rec.id} initialDeck={rec.deck} />
      </div>
    </div>
  );
}
