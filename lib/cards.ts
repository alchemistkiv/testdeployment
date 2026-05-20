// Kart modeli ve saf yardımcılar (IO yok → kapsamlı test edilebilir).
// Foursquare'in ham mekan nesnesini uygulamanın kullandığı Card'a çeviririz.

export type Card = {
  fsqId: string;
  name: string;
  category: string | null;
  photoUrl: string | null;
  /** Foursquare puanı 0–10 ölçeğinde. */
  rating: number | null;
  /** Fiyat seviyesi 1–4. */
  priceLevel: number | null;
  distanceMeters: number | null;
  address: string | null;
  openNow: boolean | null;
};

export type SortMode = "RELEVANCE" | "RATING" | "DISTANCE" | "POPULARITY";

// DeepSeek'in serbest cümleden ayıkladığı yapılandırılmış arama isteği.
export type PlaceQuery = {
  /** Foursquare'in geocode edebileceği yer adı (semt/şehir/bölge). */
  near: string;
  /** Kısa İngilizce arama anahtarı, ör. "coffee", "rooftop bar". */
  query: string;
  openNow: boolean;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortMode;
};

/** prefix + boyut + suffix → tam foto URL'i. Parçalar eksikse null. */
export function photoUrlFromParts(
  prefix?: string | null,
  suffix?: string | null,
  size = "600x600"
): string | null {
  if (!prefix || !suffix) return null;
  return `${prefix}${size}${suffix}`;
}

/** 1–4 fiyat seviyesini "$"–"$$$$" etiketine çevirir. */
export function priceLabel(level?: number | null): string | null {
  if (typeof level !== "number" || level < 1 || level > 4) return null;
  return "$".repeat(level);
}

/** Mesafeyi okunur metne çevirir (ör. "320 m", "1.2 km"). */
export function formatDistance(meters?: number | null): string | null {
  if (typeof meters !== "number" || meters < 0) return null;
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Foursquare ham mekan nesnesini Card'a çevirir (savunmacı; alanlar opsiyonel). */
export function fsqPlaceToCard(p: Record<string, any>): Card {
  const firstPhoto = Array.isArray(p?.photos) ? p.photos[0] : undefined;
  return {
    fsqId: p?.fsq_place_id ?? p?.fsq_id ?? "",
    name: typeof p?.name === "string" ? p.name : "",
    category: p?.categories?.[0]?.name ?? null,
    photoUrl: photoUrlFromParts(firstPhoto?.prefix, firstPhoto?.suffix),
    rating: typeof p?.rating === "number" ? p.rating : null,
    priceLevel: typeof p?.price === "number" ? p.price : null,
    distanceMeters: typeof p?.distance === "number" ? p.distance : null,
    address: p?.location?.formatted_address ?? null,
    openNow: typeof p?.hours?.open_now === "boolean" ? p.hours.open_now : null,
  };
}
