"use client";

// Oturum konusundan kartları getirir (DeepSeek → OSM) ve kaydırma destesine verir.

import { useEffect, useState } from "react";
import type { Session } from "@/lib/session";
import type { Card } from "@/lib/cards";
import { SwipeDeck } from "./SwipeDeck";

type Status = "loading" | "ready" | "error";

export function Cards({
  session,
  onBack,
}: {
  session: Session;
  onBack: () => void;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [cards, setCards] = useState<Card[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: session.topic }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (cancelled) return;
        if (!r.ok) {
          setError(data.error ?? "Kartlar getirilemedi.");
          setStatus("error");
          return;
        }
        setCards(Array.isArray(data.cards) ? data.cards : []);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setError("Bağlantı hatası.");
        setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [session.topic]);

  if (status === "loading") {
    return (
      <main className="bg-party flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
        <p className="text-sm font-semibold">Kartlar hazırlanıyor…</p>
      </main>
    );
  }

  if (status === "error" || cards.length === 0) {
    return (
      <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6">
        <div className="w-full max-w-md rounded-2xl bg-white/95 p-6 text-center shadow-2xl">
          <p className="text-base font-bold text-ink">
            {status === "error" ? "Bir şeyler ters gitti 😕" : "Hiç kart bulunamadı 🤔"}
          </p>
          <p className="mt-1 text-sm text-ink/60">
            {status === "error" ? error : "Cümleyi biraz değiştirip tekrar dener misin?"}
          </p>
          <button
            onClick={onBack}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-3 text-base font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
          >
            Lobiye dön
          </button>
        </div>
      </main>
    );
  }

  return <SwipeDeck cards={cards} onBack={onBack} />;
}
