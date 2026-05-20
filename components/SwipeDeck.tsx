"use client";

// 5. adım: kaydırma + realtime eşleşme. Sağa beğen / sola geç (sürükle + butonlar).
// Her oy DB'ye yazılır; oylar değiştikçe eşik kontrol edilir, eşleşme kaydedilir ve
// realtime ile tüm gruba konfetili "Eşleşme!" bildirimi gider.

import { useEffect, useRef, useState } from "react";
import type { Card } from "@/lib/cards";
import type { Session } from "@/lib/session";
import { dragHint, dragRotation, swipeDecision } from "@/lib/swipe";
import { likeCountsByCard, matchedCardIds } from "@/lib/match";
import {
  castVote,
  listParticipants,
  loadMatches,
  loadVotes,
  recordMatch,
  subscribeTable,
} from "@/lib/db";
import { CardFace } from "./CardFace";
import { Confetti } from "./Confetti";

export function SwipeDeck({
  cards,
  session,
  userId,
  onBack,
}: {
  cards: Card[];
  session: Session;
  userId: string;
  onBack: () => void;
}) {
  const [index, setIndex] = useState(0);
  const [liked, setLiked] = useState<Card[]>([]);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<"like" | "pass" | null>(null);
  const startX = useRef<number | null>(null);

  const [matchCard, setMatchCard] = useState<Card | null>(null);
  const [confetti, setConfetti] = useState(false);
  const shownMatches = useRef<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [partCount, setPartCount] = useState(0);

  const done = index >= cards.length;
  const current = cards[index];
  const next = cards[index + 1];
  const hint = dragHint(dx);

  // Realtime eşleşme: oylar değişince eşik kontrolü + kayıt; eşleşme gelince konfeti.
  useEffect(() => {
    const cleanups: Array<() => void> = [];
    try {
      const onVotesChange = async () => {
        const [votes, participants] = await Promise.all([
          loadVotes(session.id),
          listParticipants(session.id),
        ]);
        setLikeCounts(likeCountsByCard(votes));
        setPartCount(participants.length);
        const matched = matchedCardIds(
          votes,
          session.thresholdType,
          participants.length,
          session.thresholdCount
        );
        for (const cid of matched) await recordMatch(session.id, cid);
      };

      const onMatchesChange = async () => {
        const ids = await loadMatches(session.id);
        for (const id of ids) {
          if (shownMatches.current.has(id)) continue;
          shownMatches.current.add(id);
          const card = cards.find((c) => c.id === id);
          if (card) {
            setMatchCard(card);
            setConfetti(true);
            window.setTimeout(() => {
              setConfetti(false);
              setMatchCard(null);
            }, 4500);
          }
        }
      };

      // İlk açılışta mevcut eşleşmeleri "gösterildi" say (eski eşleşme tekrar patlamasın),
      // sonra mevcut oylardan yeni eşleşme varsa kaydet.
      loadMatches(session.id)
        .then((ids) => ids.forEach((id) => shownMatches.current.add(id)))
        .then(onVotesChange)
        .catch(() => {});

      cleanups.push(subscribeTable("votes", session.id, onVotesChange));
      cleanups.push(subscribeTable("matches", session.id, onMatchesChange));
    } catch {
      // Supabase env yoksa realtime'ı atla.
    }
    return () => cleanups.forEach((fn) => fn());
  }, [session.id, session.thresholdType, session.thresholdCount, cards]);

  // Klavye erişilebilirliği: → beğen, ← geç.
  useEffect(() => {
    if (done) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") commit("like");
      else if (e.key === "ArrowLeft") commit("pass");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, index, leaving]);

  function commit(dir: "like" | "pass") {
    if (leaving) return;
    const card = cards[index];
    setDragging(false);
    setLeaving(dir);
    if (card) {
      castVote(session.id, card.id, userId, dir === "like").catch(() => {});
    }
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

  const tx = leaving === "like" ? 600 : leaving === "pass" ? -600 : dx;
  const rot = leaving ? (leaving === "like" ? 18 : -18) : dragRotation(dx);
  const transition = dragging ? "none" : "transform 260ms ease-out";

  return (
    <main className="bg-party flex min-h-dvh flex-col px-6 py-8">
      {confetti && <Confetti />}
      {matchCard && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/40 px-6">
          <div className="animate-pop w-full max-w-sm rounded-[2rem] bg-white p-7 text-center shadow-2xl">
            <div className="text-5xl">🎉</div>
            <h2 className="mt-2 text-2xl font-extrabold text-brand">Eşleşme!</h2>
            <p className="mt-1 text-lg font-bold text-ink">{matchCard.name}</p>
            {matchCard.category && (
              <p className="text-sm text-ink/50">{matchCard.category}</p>
            )}
          </div>
        </div>
      )}

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
            <p className="mt-2 h-5 text-center text-sm font-semibold text-white/90">
              {current && partCount > 0 && likeCounts[current.id] > 0
                ? `❤️ Bu kartı ${likeCounts[current.id]}/${partCount} kişi beğendi`
                : ""}
            </p>
            <div className="relative mt-2 flex-1">
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
            <p className="mt-3 text-center text-xs font-semibold text-white/60">
              ← geç · beğen →
            </p>
          </>
        ) : (
          <div className="mt-6 flex-1">
            <div className="rounded-[2rem] bg-white/95 p-6 shadow-2xl">
              <h1 className="text-2xl font-extrabold text-ink">Kaydırma bitti! 🎉</h1>
              <p className="mt-1 text-sm text-ink/60">
                {liked.length} mekan beğendin. Grubun beğenileri eşiğe ulaşınca
                otomatik "Eşleşme!" bildirimi düşer.
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
                onClick={onBack}
                className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-3.5 text-base font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
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
