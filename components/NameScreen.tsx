"use client";

import { useState } from "react";

export function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const valid = name.trim().length >= 2;

  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="animate-float mb-2 text-6xl">🏝️</div>
          <h1 className="bg-gradient-to-r from-brand to-grape bg-clip-text text-4xl font-extrabold text-transparent">
            Bali Choice
          </h1>
          <p className="mt-2 text-sm font-medium text-ink/60">
            Grupça kaydır, eşleş, birlikte karar ver.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) onSubmit(name);
          }}
        >
          <label className="mb-2 block text-sm font-semibold text-ink/70">
            Seni nasıl çağıralım?
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Adın..."
            autoFocus
            maxLength={24}
            className="w-full rounded-2xl border-2 border-ink/10 bg-cream px-4 py-3.5 text-lg font-semibold text-ink outline-none transition focus:border-brand"
          />

          <button
            type="submit"
            disabled={!valid}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
          >
            Hadi başla →
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-ink/40">
          Hesap gerekmez. İsmin sadece bu cihazda saklanır.
        </p>
      </div>
    </main>
  );
}
