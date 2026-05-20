"use client";

// Oturum kartlarını DB'den yükler; deste boşsa konudan üretip (DeepSeek → OSM)
// DB'ye kaydeder, sonra kaydırma destesine verir. Kartlar paylaşımlı: herkes aynı deste.

import { useEffect, useState } from "react";
import type { Session } from "@/lib/session";
import type { Card } from "@/lib/cards";
import { loadCards, loadVotes, saveCards } from "@/lib/db";
import { filterUnvoted } from "@/lib/match";
import { SwipeDeck } from "./SwipeDeck";

type Status = "loading" | "ready" | "error";

export function Cards({
  session,
  userId,
  onBack,
}: {
  session: Session;
  userId: string;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [cards, setCards] = useState<Card[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("loading");
      try {
        let existing = await loadCards(session.id);
        if (existing.length === 0) {
          const res = await fetch("/api/cards", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic: session.topic }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) throw new Error(data.error ?? "Kartlar getirilemedi.");
          await saveCards(session.id, data.cards ?? []);
          existing = await loadCards(session.id);
        }
        const votes = await loadVotes(session.id);
        if (cancelled) return;
        setTotalCount(existing.length);
        setCards(filterUnvoted(existing, votes, userId));
        setStatus("ready");
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Bağlantı hatası.");
        setStatus("error");
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [session.id, session.topic, userId, reloadKey]);

  if (status === "loading") {
    return (
      <main className="bg-party flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <p className="text-sm font-semibold">Kartlar hazırlanıyor…</p>
      </main>
    );
  }

  if (status === "error" || cards.length === 0) {
    const allSwiped = status !== "error" && totalCount > 0;
    const title =
      status === "error"
        ? "Bir şeyler ters gitti 😕"
        : allSwiped
          ? "Tüm kartları kaydırdın ✅"
          : "Hiç kart bulunamadı 🤔";
    const desc =
      status === "error"
        ? error
        : allSwiped
          ? "Grubun beğenileri eşiğe ulaşınca eşleşme bildirimi düşer."
          : "Cümleyi biraz değiştirip tekrar dener misin?";
    return (
      <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 text-center shadow-2xl">
          <p className="text-base font-bold text-ink">{title}</p>
          <p className="mt-1 text-sm text-ink/60">{desc}</p>
          {!allSwiped && (
            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-5 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-3 text-base font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
            >
              Tekrar dene
            </button>
          )}
          <button
            onClick={onBack}
            className={`w-full rounded-2xl py-3 text-base font-bold transition active:scale-[0.97] ${
              allSwiped
                ? "mt-5 bg-gradient-to-r from-brand to-brand-2 text-white shadow-lg shadow-brand/30"
                : "mt-3 text-ink/50 hover:underline"
            }`}
          >
            Lobiye dön
          </button>
        </div>
      </main>
    );
  }

  return (
    <SwipeDeck cards={cards} session={session} userId={userId} onBack={onBack} />
  );
}
