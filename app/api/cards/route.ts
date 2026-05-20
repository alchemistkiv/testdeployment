// POST /api/cards  { topic: string }
// Akış: DeepSeek cümleyi ayıklar (beyin) → Foursquare gerçek kartları getirir (gözler).
// Anahtarlar yalnızca burada (sunucu) okunur; istemciye sızmaz.

import { NextResponse } from "next/server";
import { validateTopic } from "@/lib/session";
import { parseTopic } from "@/lib/intent";
import { searchPlaces } from "@/lib/foursquare";

export async function POST(req: Request) {
  let topic = "";
  try {
    const body = (await req.json()) as { topic?: unknown };
    topic = typeof body.topic === "string" ? body.topic : "";
  } catch {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  if (!validateTopic(topic)) {
    return NextResponse.json(
      { error: "Konu en az 3 karakter olmalı." },
      { status: 400 }
    );
  }

  try {
    const query = await parseTopic(topic);
    const cards = await searchPlaces(query);
    return NextResponse.json({ query, cards });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
