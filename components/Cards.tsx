"use client";

// 3. adım: kartları getirip gösterir. Kaydırma (swipe) etkileşimi 4. adımda gelecek;
// burada üretilen gerçek kartları (foto + bilgi) doğrulamak için liste halinde sunuyoruz.

import { useEffect, useState } from "react";
import type { Session } from "@/lib/session";
import { formatDistance, priceLabel, type Card } from "@/lib/cards";

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

  return (
    <main className="bg-party min-h-dvh px-6 py-10">
      <div className="mx-auto w-full max-w-md">
        <button
          onClick={onBack}
          className="mb-3 text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Lobiye dön
        </button>
        <h1 className="text-2xl font-extrabold leading-tight text-white">
          “{session.topic}”
        </h1>

        {status === "loading" && (
          <div className="mt-10 flex flex-col items-center gap-3 text-white">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white" />
            <p className="text-sm font-semibold">Kartlar hazırlanıyor…</p>
          </div>
        )}

        {status === "error" && (
          <div className="mt-8 rounded-2xl bg-white/95 p-5 text-center">
            <p className="text-base font-bold text-ink">Bir şeyler ters gitti 😕</p>
            <p className="mt-1 text-sm text-ink/60">{error}</p>
          </div>
        )}

        {status === "ready" && cards.length === 0 && (
          <div className="mt-8 rounded-2xl bg-white/95 p-5 text-center">
            <p className="text-base font-bold text-ink">Hiç kart bulunamadı 🤔</p>
            <p className="mt-1 text-sm text-ink/60">
              Cümleyi biraz değiştirip tekrar dener misin?
            </p>
          </div>
        )}

        {status === "ready" && cards.length > 0 && (
          <div className="mt-5 space-y-4">
            {cards.map((c) => (
              <CardItem key={c.id || c.name} card={c} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function CardItem({ card }: { card: Card }) {
  const price = priceLabel(card.priceLevel);
  const distance = formatDistance(card.distanceMeters);

  return (
    <div className="animate-pop overflow-hidden rounded-3xl bg-white shadow-xl">
      <div className="relative h-48 w-full bg-gradient-to-br from-brand to-brand-2">
        {card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.photoUrl}
            alt={card.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            📍
          </div>
        )}
        {card.openNow !== null && (
          <span
            className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-xs font-bold ${
              card.openNow ? "bg-mint text-white" : "bg-ink/70 text-white"
            }`}
          >
            {card.openNow ? "Açık" : "Kapalı"}
          </span>
        )}
      </div>
      <div className="p-4">
        <h2 className="text-lg font-extrabold text-ink">{card.name}</h2>
        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold">
          {card.rating !== null && (
            <span className="rounded-full bg-grape/10 px-2.5 py-0.5 text-grape">
              ⭐ {card.rating.toFixed(1)}
            </span>
          )}
          {price && (
            <span className="rounded-full bg-mint/10 px-2.5 py-0.5 text-mint">
              {price}
            </span>
          )}
          {distance && (
            <span className="rounded-full bg-ink/5 px-2.5 py-0.5 text-ink/60">
              {distance}
            </span>
          )}
          {card.category && (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-brand">
              {card.category}
            </span>
          )}
        </div>
        {card.address && (
          <p className="mt-2 text-xs text-ink/50">{card.address}</p>
        )}
      </div>
    </div>
  );
}
