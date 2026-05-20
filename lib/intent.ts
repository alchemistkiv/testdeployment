// DeepSeek "beyin": kullanıcının serbest cümlesinden (TR/EN) OpenStreetMap
// arama parametreleri ayıklar. Yalnızca sunucu — anahtar gizli.

import type { PlaceQuery } from "./cards";

const API_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat"; // şu an deepseek-v4-flash'a çözümleniyor

const SYSTEM_PROMPT = `You convert a free-text request (Turkish or English) into parameters for an OpenStreetMap venue search.
Return ONLY a JSON object with these keys:
- "near": string — a place name a geocoder can resolve (the neighborhood/city/area mentioned).
- "kinds": array of strings — pick from EXACTLY this set:
  food/drink: "cafe","restaurant","bar","fast_food","ice_cream","nightclub";
  stay: "hotel","hostel","guesthouse","resort";
  activity/sightseeing: "attraction","museum","gallery","viewpoint","themepark","zoo","park","spa".
  Map examples: coffee/tea -> "cafe"; dinner/lunch/meal/food -> "restaurant"; drinks/cocktails -> "bar"; quick bite -> "fast_food"; stay/sleep/accommodation/hotel -> "hotel" (+ "guesthouse"/"hostel" if budget); things to do/sightseeing/activity -> "attraction" (+ "museum"/"viewpoint"/"park" as fitting). Include 1-3 most relevant kinds.
- "keywords": array of SHORT lowercase english keywords for cuisine/vibe (e.g. ["vegan"], ["rooftop"], ["seafood"], ["family"], ["luxury"]). Use [] if none implied.
Output JSON only, no prose.`;

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
  if (!near) throw new Error("İstekten bir konum çıkaramadım — cümleye yer ekle.");

  const kinds = Array.isArray(parsed.kinds)
    ? parsed.kinds.filter((k): k is string => typeof k === "string")
    : [];
  const keywords = Array.isArray(parsed.keywords)
    ? parsed.keywords.filter((k): k is string => typeof k === "string")
    : [];

  return { near, kinds, keywords };
}
