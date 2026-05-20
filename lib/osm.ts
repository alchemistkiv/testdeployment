// OpenStreetMap mekan motoru (yalnızca sunucu). $0, kart/kayıt/anahtar yok.
// Nominatim → yer adını koordinata çevirir. Overpass → çevredeki mekanları getirir.

import { osmElementToCard, type Card, type PlaceQuery } from "./cards";

const NOMINATIM = "https://nominatim.openstreetmap.org/search";
// Public Overpass sunucuları yük altında zaman aşımına düşebiliyor; sırayla deneriz.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];
// OSM kullanım politikası geçerli bir User-Agent ister; UA'sız istekler reddedilir.
const USER_AGENT = "balichoice/0.1 (group decision app)";
const SEARCH_RADIUS = 2500;

// Overpass'ı çalıştırır; bir sunucu hata/timeout verirse sıradakine geçer.
// Public sunucular yük altında takılabildiği için: her isteğe abort timeout
// (askıda kalan sunucuda beklemeyip diğerine geç) + tüm listeyi 2 tur dene.
// Önemli: Overpass HTTP 200 dönüp gövdede "remark" ile timeout bildirebiliyor.
async function runOverpass(ql: string): Promise<unknown[]> {
  let lastError: Error | null = null;
  for (let round = 0; round < 2; round++) {
    for (const url of OVERPASS_ENDPOINTS) {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 20000);
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            "User-Agent": USER_AGENT,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `data=${encodeURIComponent(ql)}`,
          signal: ctrl.signal,
        });
        if (!res.ok) {
          lastError = new Error(`Overpass ${res.status}`);
          continue;
        }
        const data = (await res.json()) as { elements?: unknown[]; remark?: string };
        if (typeof data.remark === "string" && /timed out|error/i.test(data.remark)) {
          lastError = new Error(`Overpass: ${data.remark}`);
          continue;
        }
        return Array.isArray(data.elements) ? data.elements : [];
      } catch (e) {
        lastError = e instanceof Error ? e : new Error("Overpass bağlantı hatası");
      } finally {
        clearTimeout(timer);
      }
    }
  }
  throw lastError ?? new Error("Overpass erişilemedi.");
}

// Anlamsal tür → OSM etiket seçicileri. DeepSeek bu anahtarlardan üretir.
const KIND_SELECTORS: Record<string, string[]> = {
  // Yeme-içme
  cafe: ["amenity=cafe"],
  restaurant: ["amenity=restaurant"],
  bar: ["amenity=bar", "amenity=pub"],
  fast_food: ["amenity=fast_food"],
  ice_cream: ["amenity=ice_cream"],
  nightclub: ["amenity=nightclub"],
  // Konaklama
  hotel: ["tourism=hotel"],
  hostel: ["tourism=hostel"],
  guesthouse: ["tourism=guest_house"],
  resort: ["tourism=hotel", "leisure=resort"],
  // Aktivite / gezilecek
  attraction: ["tourism=attraction"],
  museum: ["tourism=museum"],
  gallery: ["tourism=gallery"],
  viewpoint: ["tourism=viewpoint"],
  themepark: ["tourism=theme_park"],
  zoo: ["tourism=zoo"],
  park: ["leisure=park"],
  spa: ["leisure=spa", "amenity=spa"],
};

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
  const kinds = q.kinds.filter((k) => k in KIND_SELECTORS);
  const useKinds = kinds.length ? kinds : ["cafe", "restaurant"];

  const center = await geocode(q.near);

  // Bounding-box (around yerine): poligonlarda çok daha hızlı ve public
  // sunucularda güvenilir. Mesafeyi yine merkeze göre haversine ile hesaplarız.
  // İlişkileri (relation) atlayıp node+way (nw) kullanmak sorguyu hafifletir.
  const buildQl = (radius: number) => {
    const latDelta = radius / 111320;
    const lonDelta = radius / (111320 * Math.cos((center.lat * Math.PI) / 180));
    const bbox = `${center.lat - latDelta},${center.lon - lonDelta},${
      center.lat + latDelta
    },${center.lon + lonDelta}`;
    const selectors = useKinds
      .flatMap((k) => KIND_SELECTORS[k])
      .map((sel) => `nw[${sel}][name](${bbox});`)
      .join("");
    return `[out:json][timeout:25];(${selectors});out center 60;`;
  };

  // Boş gelirse (seyrek bölge) yarıçapı bir kez genişletip tekrar dene.
  let elements = await runOverpass(buildQl(SEARCH_RADIUS));
  if (elements.length === 0) {
    elements = await runOverpass(buildQl(SEARCH_RADIUS * 2));
  }

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
