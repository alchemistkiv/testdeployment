// OpenStreetMap mekan motoru (yalnızca sunucu). $0, kart/kayıt/anahtar yok.
// Nominatim → yer adını koordinata çevirir. Overpass → çevredeki mekanları getirir.

import { osmElementToCard, type Card, type PlaceQuery } from "./cards";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const OVERPASS = "https://overpass-api.de/api/interpreter";
// OSM kullanım politikası geçerli bir User-Agent ister; UA'sız istekler reddedilir.
const USER_AGENT = "balichoice/0.1 (group decision app)";
const SEARCH_RADIUS = 2500;

const ALLOWED_KINDS = new Set([
  "cafe",
  "restaurant",
  "bar",
  "pub",
  "fast_food",
  "ice_cream",
  "biergarten",
]);

async function geocode(near: string): Promise<{ lat: number; lon: number }> {
  const url = `${NOMINATIM}?q=${encodeURIComponent(near)}&format=json&limit=1`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const arr = (await res.json()) as { lat?: string; lon?: string }[];
  const hit = Array.isArray(arr) ? arr[0] : undefined;
  if (!hit?.lat || !hit?.lon) throw new Error(`Konum bulunamadı: ${near}`);
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
}

function rankScore(card: Card, keywords: string[]): number {
  if (keywords.length === 0) return 0;
  const hay = `${card.name} ${card.category ?? ""}`.toLowerCase();
  return keywords.reduce((n, kw) => (kw && hay.includes(kw) ? n + 1 : n), 0);
}

export async function searchPlaces(
  q: PlaceQuery,
  limit = 15
): Promise<Card[]> {
  const kinds = q.kinds.filter((k) => ALLOWED_KINDS.has(k));
  const useKinds = kinds.length ? kinds : ["cafe", "restaurant"];

  const center = await geocode(q.near);

  const selectors = useKinds
    .map(
      (k) =>
        `nwr[amenity=${k}][name](around:${SEARCH_RADIUS},${center.lat},${center.lon});`
    )
    .join("");
  const ql = `[out:json][timeout:25];(${selectors});out center 80;`;

  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `data=${encodeURIComponent(ql)}`,
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);

  const data = (await res.json()) as { elements?: unknown[] };
  const elements = Array.isArray(data.elements) ? data.elements : [];

  // İsme göre tekilleştir.
  const seen = new Set<string>();
  const cards: Card[] = [];
  for (const el of elements) {
    const card = osmElementToCard(el as Record<string, unknown>, center);
    const key = card.name.toLowerCase();
    if (!card.name || seen.has(key)) continue;
    seen.add(key);
    cards.push(card);
  }

  const keywords = q.keywords.map((s) => s.toLowerCase()).filter(Boolean);
  cards.sort((a, b) => {
    const diff = rankScore(b, keywords) - rankScore(a, keywords);
    if (diff !== 0) return diff;
    return (a.distanceMeters ?? Infinity) - (b.distanceMeters ?? Infinity);
  });

  return cards.slice(0, limit);
}
