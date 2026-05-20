"use client";

export function HomeHub({
  name,
  onCreate,
  onJoin,
  onReset,
}: {
  name: string;
  onCreate: () => void;
  onJoin: () => void;
  onReset: () => void;
}) {
  return (
    <main className="bg-party flex min-h-dvh flex-col items-center justify-center px-6 py-10 text-center">
      <div className="w-full max-w-sm animate-pop rounded-[2rem] bg-white/95 p-8 shadow-2xl">
        <div className="animate-float mb-3 text-6xl">🏝️</div>
        <h1 className="text-3xl font-extrabold text-ink">
          Selam, <span className="text-brand">{name}</span>!
        </h1>
        <p className="mt-2 text-sm font-medium text-ink/60">
          Nereye gideceğinize birlikte karar verin. Bir oturum başlat, arkadaşların
          katılsın, kaydırın.
        </p>

        <button
          onClick={onCreate}
          className="mt-7 w-full rounded-2xl bg-gradient-to-r from-brand to-brand-2 py-4 text-lg font-bold text-white shadow-lg shadow-brand/30 transition active:scale-[0.97]"
        >
          🎬 Yeni oturum başlat
        </button>

        <button
          onClick={onJoin}
          className="mt-3 w-full rounded-2xl border-2 border-brand/30 bg-white py-4 text-lg font-bold text-brand transition active:scale-[0.97]"
        >
          🔑 Koda katıl
        </button>

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
