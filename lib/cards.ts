// Kart modeli ve saf yardımcılar (IO yok → kapsamlı test edilebilir).
// Mekan kaynağı OpenStreetMap (Overpass): kart/kayıt/anahtar gerektirmez, $0.
// Not: OSM'de foto/puan/fiyat çoğunlukla yok; bunlar varsa gösterilir, yoksa null.

export type Card = {
  id: string;
  name: string;
  category: string | null;
  photoUrl: string | null;
  /** OSM'de puan yok → genelde null. */
  rating: number | null;
  /** OSM'de fiyat seviyesi yok → genelde null. */
  priceLevel: number | null;
  distanceMeters: number | null;
  address: string | null;
  openNow: boolean | null;
};

// DeepSeek'in serbest cümleden ayıkladığı OSM arama parametreleri.
export type PlaceQuery = {
  /** Nominatim'in geocode edebileceği yer adı (semt/şehir/bölge). */
  near: string;
  /** OSM amenity türleri, ör. ["cafe","restaurant"]. */
  kinds: string[];
  /** Kısa İngilizce anahtarlar (mutfak/atmosfer), ör. ["vegan","rooftop"]. */
  keywords: string[];
};

// OSM tür değeri (amenity/tourism/leisure) → okunur TR etiket.
const TYPE_LABELS: Record<string, string> = {
  cafe: "Kafe",
  restaurant: "Restoran",
  bar: "Bar",
  pub: "Pub",
  fast_food: "Fast food",
  ice_cream: "Dondurma",
  biergarten: "Biergarten",
  nightclub: "Gece kulübü",
  spa: "Spa",
  hotel: "Otel",
  hostel: "Hostel",
  guest_house: "Pansiyon",
  resort: "Resort",
  attraction: "Gezilecek yer",
  museum: "Müze",
  viewpoint: "Manzara noktası",
  gallery: "Sanat galerisi",
  theme_park: "Tema parkı",
  zoo: "Hayvanat bahçesi",
  park: "Park",
};

/** 1–4 fiyat seviyesini "$"–"$$$$" etiketine çevirir (varsa). */
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

/** İki koordinat arası mesafe (metre), haversine. */
export function haversineMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function titleize(s: string): string {
  const t = s.replace(/[_]+/g, " ").trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

/** OSM etiketlerinden kategori metni (mutfak öncelikli, yoksa tür). */
export function osmCategory(tags: Record<string, any>): string | null {
  const cuisine = typeof tags?.cuisine === "string" ? tags.cuisine : "";
  if (cuisine) return titleize(cuisine.split(/[;,]/)[0]);
  const type = tags?.amenity ?? tags?.tourism ?? tags?.leisure;
  if (typeof type === "string") return TYPE_LABELS[type] ?? titleize(type);
  return null;
}

/** OSM adres etiketlerinden okunur adres satırı. */
export function osmAddress(tags: Record<string, any>): string | null {
  const street = tags?.["addr:street"];
  const hn = tags?.["addr:housenumber"];
  const city = tags?.["addr:city"];
  const line = [
    street && hn ? `${street} ${hn}` : street || null,
    city || null,
  ]
    .filter(Boolean)
    .join(", ");
  if (line) return line;
  return typeof tags?.["addr:full"] === "string" ? tags["addr:full"] : null;
}

/** OSM'de nadiren bulunan foto: doğrudan image URL'i ya da Wikimedia Commons dosyası. */
export function osmPhoto(tags: Record<string, any>): string | null {
  const image = tags?.image;
  if (typeof image === "string" && /^https?:\/\//.test(image)) return image;
  const wc = tags?.wikimedia_commons;
  if (typeof wc === "string" && wc.startsWith("File:")) {
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(
      wc.slice(5)
    )}?width=600`;
  }
  return null;
}

/** Foto olmayan kartlarda gösterilecek kategori emojisi (görsel ipucu). */
export function categoryEmoji(text?: string | null): string {
  const t = (text ?? "").toLowerCase();
  if (/kafe|coffee|cafe|çay|tea/.test(t)) return "☕";
  if (/fast|burger/.test(t)) return "🍔";
  if (/dondurma|ice/.test(t)) return "🍦";
  if (/bar|pub|cocktail|drink|gece|night/.test(t)) return "🍸";
  if (/restoran|restaurant|yemek|food|dinner|lunch|mutfak/.test(t)) return "🍽️";
  if (/otel|hotel|hostel|pansiyon|guest|resort|konaklama|stay/.test(t)) return "🏨";
  if (/müze|museum|galeri|gallery|sanat|art/.test(t)) return "🏛️";
  if (/manzara|view/.test(t)) return "🌄";
  if (/park|bahçe|garden/.test(t)) return "🌳";
  if (/spa/.test(t)) return "💆";
  if (/gezilecek|attraction|tema|theme|zoo/.test(t)) return "🎡";
  return "📍";
}

/** Overpass element'ini Card'a çevirir; mesafe merkeze göre hesaplanır. */
export function osmElementToCard(
  el: Record<string, any>,
  center: { lat: number; lon: number }
): Card {
  const tags = el?.tags ?? {};
  const lat = typeof el?.lat === "number" ? el.lat : el?.center?.lat;
  const lon = typeof el?.lon === "number" ? el.lon : el?.center?.lon;
  const distanceMeters =
    typeof lat === "number" && typeof lon === "number"
      ? Math.round(haversineMeters(center.lat, center.lon, lat, lon))
      : null;

  return {
    id: el?.type && el?.id != null ? `${el.type}/${el.id}` : "",
    name: typeof tags.name === "string" ? tags.name : "",
    category: osmCategory(tags),
    photoUrl: osmPhoto(tags),
    rating: null,
    priceLevel: null,
    distanceMeters,
    address: osmAddress(tags),
    openNow: null,
  };
}
