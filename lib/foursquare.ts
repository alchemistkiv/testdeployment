// Foursquare Places API istemcisi (yalnızca sunucu — anahtar gizli).
// "Gözler": konuma göre gerçek mekanları foto + puan + fiyat + mesafe ile getirir.

import { fsqPlaceToCard, type Card, type PlaceQuery } from "./cards";

const SEARCH_URL = "https://places-api.foursquare.com/places/search";
const API_VERSION = "2025-06-17";

// Search yanıtında dönmesini istediğimiz alanlar (foto/puan/fiyat varsayılanda gelmez).
const FIELDS = [
  "fsq_place_id",
  "name",
  "location",
  "categories",
  "rating",
  "price",
  "distance",
  "hours",
  "photos",
].join(",");

export async function searchPlaces(q: PlaceQuery, limit = 12): Promise<Card[]> {
  const key = process.env.FOURSQUARE_API_KEY;
  if (!key) throw new Error("FOURSQUARE_API_KEY tanımlı değil.");

  const params = new URLSearchParams({
    query: q.query,
    near: q.near,
    limit: String(Math.min(Math.max(limit, 1), 50)),
    sort: q.sort,
    fields: FIELDS,
  });
  if (q.openNow) params.set("open_now", "true");
  if (q.minPrice) params.set("min_price", String(q.minPrice));
  if (q.maxPrice) params.set("max_price", String(q.maxPrice));

  const res = await fetch(`${SEARCH_URL}?${params}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "X-Places-Api-Version": API_VERSION,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Foursquare ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as { results?: unknown[] };
  const results = Array.isArray(data.results) ? data.results : [];
  return results.map((r) => fsqPlaceToCard(r as Record<string, unknown>));
}
