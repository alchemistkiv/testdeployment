"use client";

import { useEffect, useState } from "react";
import {
  requiredVotes,
  thresholdSummary,
  type Participant,
  type Session,
} from "@/lib/session";
import type { Card } from "@/lib/cards";
import {
  listParticipants,
  loadCards,
  loadMatches,
  loadVotes,
  subscribeTable,
} from "@/lib/db";
import { finishedUserIds } from "@/lib/match";

export function Lobby({
  session,
  onClose,
  onFetchCards,
}: {
  session: Session;
  onClose: () => void;
  onFetchCards: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>(
    session.participants
  );
  const [matched, setMatched] = useState<Card[]>([]);
  const [finished, setFinished] = useState(0);

  // Realtime: biri katılınca liste canlı güncellensin.
  useEffect(() => {
    try {
      const refresh = () =>
        listParticipants(session.id).then(setParticipants).catch(() => {});
      refresh();
      return subscribeTable("participants", session.id, refresh);
    } catch {
      // Supabase env yoksa (ör. test) realtime'ı atla.
    }
  }, [session.id]);

  // Realtime: grup bir kartta eşleşince lobide canlı görünsün.
  useEffect(() => {
    const refresh = () =>
      Promise.all([loadMatches(session.id), loadCards(session.id)])
        .then(([ids, cards]) => setMatched(cards.filter((c) => ids.includes(c.id))))
        .catch(() => {});
    try {
      refresh();
      return subscribeTable("matches", session.id, refresh);
    } catch {
      // env yoksa atla
    }
  }, [session.id]);

  // Realtime: kaç kişi destesini bitirdi (tüm kartları oyladı).
  useEffect(() => {
    const refresh = () =>
      Promise.all([loadVotes(session.id), loadCards(session.id)])
        .then(([votes, cards]) =>
          setFinished(finishedUserIds(votes, cards.length).length)
        )
        .catch(() => {});
    try {
      refresh();
      return subscribeTable("votes", session.id, refresh);
    } catch {
      // env yoksa atla
    }
  }, [session.id]);

  function copyCode() {
    navigator.clipboard?.writeText(session.code).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      },
      () => {}
    );
  }

  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md animate-pop rounded-[2rem] bg-white/95 p-7 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-wider text-brand">
          Oturum hazır 🎉
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight text-ink">
          “{session.topic}”
        </h1>
        <p className="mt-2 inline-block rounded-full bg-grape/10 px-3 py-1 text-sm font-semibold text-grape">
          {thresholdSummary(session.thresholdType, session.thresholdCount)}
        </p>
        <p className="mt-1.5 text-xs font-semibold text-ink/50">
          Eşleşme için{" "}
          {requiredVotes(
            session.thresholdType,
            participants.length,
            session.thresholdCount
          )}{" "}
          beğeni gerekiyor ({participants.length} kişiye göre)
        </p>

        <div className="mt-6 rounded-2xl bg-cream p-5 text-center">
          <p className="text-sm font-semibold text-ink/60">Katılım kodu</p>
          <button
            onClick={copyCode}
            className="mt-1 text-4xl font-extrabold tracking-[0.3em] text-ink transition active:scale-95"
          >
            {session.code}
          </button>
          <p className="mt-1 text-xs font-semibold text-mint">
            {copied ? "Kopyalandı! ✓" : "Dokunup kopyala, arkadaşlarına gönder"}
          </p>
        </div>

        <div className="mt-5">
          <p className="text-sm font-bold text-ink">
            Katılımcılar ({participants.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {participants.map((p) => (
              <span
                key={p.userId}
                className="rounded-full bg-brand/10 px-3 py-1.5 text-sm font-semibold text-brand"
              >
                {p.name}
                {p.userId === session.hostUserId && " 👑"}
              </span>
            ))}
          </div>
          {finished > 0 && (
            <p className="mt-2 text-xs font-semibold text-mint">
              🃏 {finished}/{participants.length} kişi kaydırmayı bitirdi
            </p>
          )}
          <p className="mt-2 text-xs text-ink/40">
            Arkadaşların koddan katıldıkça liste canlı güncellenir.
          </p>
        </div>

        {matched.length > 0 && (
          <div className="mt-5 rounded-2xl bg-mint/10 p-4">
            <p className="text-sm font-bold text-mint">Eşleşmeler 🎉</p>
            <div className="mt-2 space-y-1.5">
              {matched.map((c) => (
                <div key={c.id} className="flex items-center gap-2">
                  <span className="font-bold text-ink">{c.name}</span>
                  {c.category && (
                    <span className="text-xs text-ink/50">{c.category}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onFetchCards}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
        >
          🃏 Kartları getir
        </button>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm font-semibold text-ink/40 underline-offset-4 hover:underline"
        >
          Oturumu kapat
        </button>
      </div>
    </main>
  );
}
