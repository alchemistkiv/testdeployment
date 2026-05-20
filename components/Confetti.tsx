"use client";

// Eşleşmede patlayan basit konfeti — bağımlılıksız, CSS animasyonu (confetti-fall).
import { useMemo } from "react";

const COLORS = ["#ff4d6d", "#ff8c42", "#6c5ce7", "#2ec4b6", "#ffd166"];

export function Confetti({ pieces = 80 }: { pieces?: number }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.6,
        duration: 1.8 + Math.random() * 1.4,
        size: 6 + Math.random() * 8,
        color: COLORS[i % COLORS.length],
        round: Math.random() > 0.5,
      })),
    [pieces]
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {bits.map((b, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: 0,
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: b.color,
            borderRadius: b.round ? "50%" : "2px",
            animation: `confetti-fall ${b.duration}s ${b.delay}s ease-in forwards`,
          }}
        />
      ))}
    </div>
  );
}
