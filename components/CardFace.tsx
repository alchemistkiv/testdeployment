"use client";

import { categoryEmoji, formatDistance, priceLabel, type Card } from "@/lib/cards";

// Bir mekanın görsel yüzü. Foto varsa foto; yoksa kategori emojili şık placeholder
// (OSM'de foto çoğunlukla yok, bu yüzden foto'suz hal birincil tasarım).
export function CardFace({ card }: { card: Card }) {
  const price = priceLabel(card.priceLevel);
  const distance = formatDistance(card.distanceMeters);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl">
      <div className="relative flex-1">
        {card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.photoUrl}
            alt={card.name}
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand to-brand-2">
            <span className="select-none text-[6rem] drop-shadow-lg">
              {categoryEmoji(card.category)}
            </span>
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
        <h2 className="text-xl font-extrabold leading-tight text-ink">
          {card.name}
        </h2>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm font-semibold">
          {card.category && (
            <span className="rounded-full bg-brand/10 px-2.5 py-0.5 text-brand">
              {card.category}
            </span>
          )}
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
        </div>
        {card.address && (
          <p className="mt-2 text-xs text-ink/50">{card.address}</p>
        )}
      </div>
    </div>
  );
}
