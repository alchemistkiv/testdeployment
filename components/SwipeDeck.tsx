"use client";

// 4. adım: kaydırma destesi. Kartları tek tek göster; sağa beğen, sola geç
// (sürükle veya buton). Tek cihazda bu kullanıcının beğenileri toplanır.
// Grup eşleşmesi + realtime 5. adımda (Supabase) gelecek.

import { useRef, useState } from "react";
import type { Card } from "@/lib/cards";
import { dragHint, dragRotation, swipeDecision } from "@/lib/swipe";
import { CardFace } from "./CardFace";

export function SwipeDeck({
  cards,
  onBack,
}: {
  cards: Card[];
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Card[]>([]);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<"like" | "pass" | null>(null);
  const startX = useRef<number | null>(null);

  const done = index >= cards.length;
  const current = cards[index];
  const next = cards[index + 1];
  const hint = dragHint(dx);

  function commit(dir: "like" | "pass") {
    if (leaving) return;
    setDragging(false);
    setLeaving(dir);
    const card = cards[index];
    window.setTimeout(() => {
      if (dir === "like" && card) setLiked((l) => [...l, card]);
      setIndex((i) => i + 1);
      setDx(0);
      setLeaving(null);
    }, 260);
  }

  function onPointerDown(e: React.PointerEvent) {
    if (leaving) return;
    startX.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (startX.current === null) return;
    setDx(e.clientX - startX.current);
  }
  function onPointerUp() {
    if (startX.current === null) return;
    const decision = swipeDecision(dx);
    startX.current = null;
    if (decision === "none") {
      setDragging(false);
      setDx(0);
    } else {
      commit(decision);
    }
  }

  function restart() {
    setIndex(0);
    setLiked([]);
    setDx(0);
    setLeaving(null);
  }

  // Üstteki kartın dönüşümü.
  const tx = leaving === "like" ? 600 : leaving === "pass" ? -600 : dx;
  const rot = leaving ? (leaving === "like" ? 18 : -18) : dragRotation(dx);
  const transition = dragging ? "none" : "transform 260ms ease-out";

  return (
    <main className="bg-party flex min-h-dvh flex-col px-6 py-8">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-sm font-semibold text-white/80 hover:text-white"
          >
            ← Lobi
          </button>
          {!done && (
            <span className="text-sm font-bold text-white/90">
              {index + 1} / {cards.length}
            </span>
          )}
        </div>

        {!done ? (
          <>
            <div className="relative mt-4 flex-1">
              {next && (
                <div className="absolute inset-0 scale-[0.96] opacity-60">
                  <CardFace card={next} />
                </div>
              )}
              {current && (
                <div
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                  className="absolute inset-0 cursor-grab touch-none active:cursor-grabbing"
                  style={{
                    transform: `translateX(${tx}px) rotate(${rot}deg)`,
                    transition,
                  }}
                >
                  {hint === "like" && (
                    <span className="absolute left-5 top-5 z-10 rotate-[-12deg] rounded-xl border-4 border-mint px-3 py-1 text-2xl font-extrabold text-mint">
                      BEĞEN
                    </span>
                  )}
                  {hint === "pass" && (
                    <span className="absolute right-5 top-5 z-10 rotate-[12deg] rounded-xl border-4 border-brand px-3 py-1 text-2xl font-extrabold text-brand">
                      GEÇ
                    </span>
                  )}
                  <CardFace card={current} />
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-8">
              <button
                onClick={() => commit("pass")}
                aria-label="Geç"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg transition active:scale-90"
              >
                ✖️
              </button>
              <button
                onClick={() => commit("like")}
                aria-label="Beğen"
                className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-3xl shadow-lg transition active:scale-90"
              >
                ❤️
              </button>
            </div>
          </>
        ) : (
          <div className="mt-6 flex-1">
            <div className="rounded-[2rem] bg-white/95 p-6 shadow-2xl">
              <h1 className="text-2xl font-extrabold text-ink">
                Hepsi bu kadar! 🎉
              </h1>
              <p className="mt-1 text-sm text-ink/60">
                {liked.length} mekan beğendin. Grup eşleşmesi sonraki adımda
                (canlı) gelecek.
              </p>
              <div className="mt-4 space-y-2">
                {liked.length === 0 && (
                  <p className="text-sm font-semibold text-ink/50">
                    Hiçbirini beğenmedin 🤷
                  </p>
                )}
                {liked.map((c) => (
                  <div
                    key={c.id || c.name}
                    className="flex items-center gap-2 rounded-2xl bg-cream px-3 py-2"
                  >
                    <span className="font-bold text-ink">{c.name}</span>
                    {c.category && (
                      <span className="text-xs text-ink/50">{c.category}</span>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={restart}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-3.5 text-base font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
              >
                Baştan kaydır
              </button>
              <button
                onClick={onBack}
                className="mt-3 w-full text-sm font-semibold text-ink/40 hover:underline"
              >
                Lobiye dön
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
