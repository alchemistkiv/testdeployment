"use client";

import { useState } from "react";

export function JoinSession({
  onJoin,
  onBack,
  busy,
  error,
}: {
  onJoin: (code: string) => void;
  onBack: () => void;
  busy: boolean;
  error: string | null;
}) {
  const [code, setCode] = useState("");
  const valid = code.trim().length >= 4;

  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-md animate-pop rounded-[2rem] bg-white/95 p-7 shadow-2xl">
        <button
          onClick={onBack}
          className="mb-3 text-sm font-semibold text-ink/40 hover:text-ink/70"
        >
          ← Geri
        </button>
        <h1 className="text-2xl font-extrabold text-ink">Koda katıl 🔑</h1>
        <p className="mt-1 text-sm text-ink/60">
          Arkadaşının paylaştığı oturum kodunu gir.
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          maxLength={8}
          autoFocus
          placeholder="K7P2QX"
          className="mt-4 w-full rounded-2xl border-2 border-ink/10 bg-cream px-4 py-3 text-center text-2xl font-extrabold tracking-[0.3em] text-ink outline-none transition focus:border-brand"
        />

        {error && (
          <p className="mt-3 text-center text-sm font-semibold text-brand">{error}</p>
        )}

        <button
          disabled={!valid || busy}
          onClick={() => onJoin(code.trim())}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97] disabled:opacity-40 disabled:active:scale-100"
        >
          {busy ? "Katılınıyor…" : "Katıl →"}
        </button>
      </div>
    </main>
  );
}
