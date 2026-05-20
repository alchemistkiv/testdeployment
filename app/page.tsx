"use client";

import { useState } from "react";
import { useIdentity } from "@/lib/identity";

export default function Home() {
  const { identity, ready, save, reset } = useIdentity();

  if (!ready) {
    return (
      <main className="bg-party flex min-h-dvh items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-white" />
      </main>
    );
  }

  if (!identity) {
    return <NameScreen onSubmit={(name) => save(name)} />;
  }

  return <HomePlaceholder name={identity.name} onReset={reset} />;
}

function NameScreen({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState("");
  const valid = name.trim().length >= 2;

  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-white/95 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="animate-float mb-2 text-6xl">🎯</div>
          <h1 className="bg-gradient-to-r from-brand to-grape bg-clip-text text-4xl font-extrabold text-transparent">
            Yalla
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

function HomePlaceholder({
  name,
  onReset,
}: {
  name: string;
  onReset: () => void;
}) {
  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-white/95 p-8 shadow-2xl">
        <div className="animate-float mb-3 text-6xl">👋</div>
        <h1 className="text-3xl font-extrabold text-ink">
          Hoş geldin, <span className="text-brand">{name}</span>!
        </h1>
        <p className="mt-3 text-sm font-medium text-ink/60">
          Kimliğin hazır. Sıradaki adımda bir <strong>oturum</strong> kurup
          (“Ubud’da kahve” gibi) eşik seçeceğiz, sonra kaydırma başlayacak.
        </p>

        <div className="mt-6 rounded-2xl bg-cream p-4 text-left text-sm text-ink/70">
          <p className="font-semibold text-ink">Sırada ne var?</p>
          <ul className="mt-2 space-y-1">
            <li>2️⃣ Oturum kurma + eşik seçimi</li>
            <li>3️⃣ Claude + Foursquare ile kart üretimi</li>
            <li>4️⃣ Kaydırma</li>
            <li>5️⃣ Eşleşme + konfeti 🎉</li>
          </ul>
        </div>

        <button
          onClick={onReset}
          className="mt-6 text-sm font-semibold text-ink/40 underline-offset-4 hover:underline"
        >
          Ben değilim / ismi değiştir
        </button>
      </div>
    </main>
  );
}
