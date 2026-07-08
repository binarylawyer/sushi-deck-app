import { notFound } from "next/navigation";
import { serverStore } from "@/lib/deck-api";
import { ScrollClient } from "./ScrollClient";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ slug: string }> };

export default async function Page({ params }: Ctx) {
  const { slug } = await params;
  const rec = await serverStore().getBySlug(slug);
  if (!rec) notFound();
  return <ScrollClient deck={rec.deck} slug={slug} />;
}
