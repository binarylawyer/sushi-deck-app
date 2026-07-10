import { notFound } from "next/navigation";
import { getDeckClient } from "@/lib/deck-client";
import { ScrollClient } from "./ScrollClient";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Ctx) {
  const { slug } = await params;
  const client = getDeckClient();
  const rec = client ? await client.getBySlug(slug) : null;
  if (!rec) notFound();
  return <ScrollClient deck={rec.deck} slug={slug} />;
}
