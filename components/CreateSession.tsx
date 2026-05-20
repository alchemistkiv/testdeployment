"use client";

import { useState } from "react";
import { validateTopic, type ThresholdType } from "@/lib/session";

const THRESHOLDS: {
  type: ThresholdType;
  emoji: string;
  title: string;
  desc: string;
}[] = [
  { type: "all", emoji: "🤝", title: "Herkes", desc: "Tek bir kişi bile beğenmezse olmaz" },
  { type: "majority", emoji: "🗳️", title: "Çoğunluk", desc: "Yarıdan fazlası beğenirse yeter" },
  { type: "count", emoji: "🔢", title: "Belirli sayı", desc: "Kaç kişi beğenince eşleşeceğini sen seç" },
];

export function CreateSession({
  onCreate,
  onBack,
}: {
  onCreate: (input: {
    topic: string;
    thresholdType: ThresholdType;
    thresholdCount: number | null;
  }) => void;
  onBack: () => void;
}) {
  const [topic, setTopic] = useState("");
  const [thresholdType, setThresholdType] = useState<ThresholdType>("majority");
  const [count, setCount] = useState(2);

  const topicValid = validateTopic(topic);

  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md animate-pop rounded-[2rem] bg-white/95 p-7 shadow-2xl">
        <button
          onClick={onBack}
          className="mb-3 text-sm font-semibold text-ink/40 hover:text-ink/70"
        >
          ← Geri
        </button>

        <h1 className="text-2xl font-extrabold text-ink">Ne karar vereceğiz? 🤔</h1>
        <p className="mt-1 text-sm text-ink/60">
          Doğal bir cümleyle yaz — konumu, niyeti, kriterleri anlat.
        </p>

        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={3}
          maxLength={200}
          autoFocus
          placeholder="Örn: Ubud'da, deniz manzaralı, çok pahalı olmayan bir akşam yemeği"
          className="mt-3 w-full resize-none rounded-2xl border-2 border-ink/10 bg-cream px-4 py-3 text-base font-medium text-ink outline-none transition focus:border-brand"
        />

        <h2 className="mt-6 text-lg font-bold text-ink">Eşleşme nasıl olsun?</h2>
        <div className="mt-3 space-y-2.5">
          {THRESHOLDS.map((t) => {
            const active = thresholdType === t.type;
            return (
              <button
                key={t.type}
                onClick={() => setThresholdType(t.type)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition active:scale-[0.98] ${
                  active
                    ? "border-brand bg-brand/5 shadow-md shadow-brand/10"
                    : "border-ink/10 bg-white"
                }`}
              >
                <span className="text-2xl">{t.emoji}</span>
                <span className="flex-1">
                  <span className="block font-bold text-ink">{t.title}</span>
                  <span className="block text-xs text-ink/55">{t.desc}</span>
                </span>
                <span
                  className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                    active ? "border-brand bg-brand" : "border-ink/20"
                  }`}
                />
              </button>
            );
          })}
        </div>

        {thresholdType === "count" && (
          <div className="mt-4 flex items-center justify-center gap-5 rounded-2xl bg-cream py-3">
            <button
              onClick={() => setCount((c) => Math.max(2, c - 1))}
              className="h-10 w-10 rounded-full bg-white text-2xl font-bold text-brand shadow active:scale-90"
              aria-label="azalt"
            >
              −
            </button>
            <span className="w-10 text-center text-3xl font-extrabold text-ink">
              {count}
            </span>
            <button
              onClick={() => setCount((c) => Math.min(20, c + 1))}
              className="h-10 w-10 rounded-full bg-white text-2xl font-bold text-brand shadow active:scale-90"
              aria-label="arttır"
            >
              +
            </button>
          </div>
        )}

        <button
          disabled={!topicValid}
          onClick={() =>
            onCreate({
              topic,
              thresholdType,
              thresholdCount: thresholdType === "count" ? count : null,
            })
          }
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          Oturumu kur →
        </button>
      </div>
    </main>
  );
}
