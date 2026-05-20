// DeepSeek "beyin": kullanıcının serbest cümlesinden (TR/EN) Foursquare için
// yapılandırılmış arama isteği ayıklar. Yalnızca sunucu — anahtar gizli.

import type { PlaceQuery, SortMode } from "./cards";

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat"; // şu an deepseek-v4-flash'a çözümleniyor

const SYSTEM_PROMPT = `You convert a free-text request (Turkish or English) into a venue search query for the Foursquare Places API.
Return ONLY a JSON object with these keys:
- "near": string — a place name Foursquare can geocode (neighborhood/city/area mentioned in the text).
- "query": string — SHORT English search keywords for the venue type (e.g. "coffee", "dinner restaurant", "rooftop bar", "brunch").
- "openNow": boolean — true only if the user implies they want places open right now.
- "minPrice": integer 1-4 or null.
- "maxPrice": integer 1-4 or null (e.g. "cheap" -> 2, "not too expensive" -> 2, "fancy" -> null/4).
- "sort": one of "RELEVANCE","RATING","DISTANCE","POPULARITY" (default "RELEVANCE"; use "RATING" if user wants good/best/highly-rated).
Infer sensibly; use null/false when a constraint is not mentioned. Output JSON only, no prose.`;

const VALID_SORTS: SortMode[] = ["RELEVANCE", "RATING", "DISTANCE", "POPULARITY"];

function clampPrice(v: unknown): number | null {
  return typeof v === "number" && v >= 1 && v <= 4 ? Math.round(v) : null;
}

export async function parseTopic(topic: string): Promise<PlaceQuery> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY tanımlı değil.");

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: topic },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 200,
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`DeepSeek ${res.status}: ${body.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("DeepSeek geçerli JSON döndürmedi.");
  }

  const near = typeof parsed.near === "string" ? parsed.near.trim() : "";
  const query =
    typeof parsed.query === "string" && parsed.query.trim()
      ? parsed.query.trim()
      : topic.trim();
  const sort =
    typeof parsed.sort === "string" && VALID_SORTS.includes(parsed.sort as SortMode)
      ? (parsed.sort as SortMode)
      : "RELEVANCE";

  if (!near) throw new Error("İstekten bir konum çıkaramadım — cümleye yer ekle.");

  return {
    near,
    query,
    openNow: parsed.openNow === true,
    minPrice: clampPrice(parsed.minPrice),
    maxPrice: clampPrice(parsed.maxPrice),
    sort,
  };
}
