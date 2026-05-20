// Canlı duman testi: Supabase tam akışı (oturum→katıl→kart→oy→eşleşme→realtime)
// + prod /api/cards. Anahtarları .env.local'dan okur (commit edilmez).
// Çalıştır: node scripts/smoke.mjs
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

function env(name) {
  const m = readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .find((l) => l.startsWith(name + "="));
  return m ? m.slice(name.length + 1).trim() : process.env[name];
}

const URL_ = env("NEXT_PUBLIC_SUPABASE_URL");
const KEY = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const PROD = "https://testdeployment-two.vercel.app";

let failed = false;
const ok = (c, m) => {
  console.log(`${c ? "PASS" : "FAIL"}  ${m}`);
  if (!c) failed = true;
};

const a = createClient(URL_, KEY);
const b = createClient(URL_, KEY);
const code = "SMK" + Math.floor(Math.random() * 9000 + 1000);

const { data: s, error: se } = await a
  .from("sessions")
  .insert({ code, topic: "smoke", threshold_type: "all", threshold_count: null, host_user_id: "u1" })
  .select()
  .single();
ok(!se && s?.id, "oturum oluştu");

await a.from("participants").insert({ session_id: s.id, user_id: "u1", name: "A" });
await b.from("participants").upsert(
  { session_id: s.id, user_id: "u2", name: "B" },
  { onConflict: "session_id,user_id" }
);
const { data: parts } = await a.from("participants").select("user_id").eq("session_id", s.id);
ok(parts?.length === 2, "iki katılımcı");

const { data: cards } = await a
  .from("cards")
  .upsert([{ session_id: s.id, osm_id: "n/1", position: 0, name: "X" }], { onConflict: "session_id,osm_id" })
  .select();
const cardId = cards?.[0]?.id;
ok(!!cardId, "kart kaydedildi");

// realtime: matches'e abone ol
let got = null;
const ch = b
  .channel("smk:" + s.id)
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "matches", filter: `session_id=eq.${s.id}` },
    (p) => (got = p.new)
  )
  .subscribe();
await new Promise((r) => setTimeout(r, 3000));

// iki oy + eşleşme
await a.from("votes").upsert({ session_id: s.id, card_id: cardId, user_id: "u1", liked: true }, { onConflict: "session_id,card_id,user_id" });
await a.from("votes").upsert({ session_id: s.id, card_id: cardId, user_id: "u2", liked: true }, { onConflict: "session_id,card_id,user_id" });
const { data: votes } = await a.from("votes").select("user_id,card_id,liked").eq("session_id", s.id);
const likes = new Set(votes.filter((v) => v.liked && v.card_id === cardId).map((v) => v.user_id));
ok(likes.size === 2, "iki beğeni sayıldı");

await a.from("matches").upsert({ session_id: s.id, card_id: cardId }, { onConflict: "session_id,card_id", ignoreDuplicates: true });
await new Promise((r) => setTimeout(r, 4000));
ok(got?.card_id === cardId, "realtime eşleşme event'i alındı");

await a.removeChannel(ch);

// ayrılma: katılımcı silinince liste düşer
await b.from("participants").delete().eq("session_id", s.id).eq("user_id", "u2");
const { data: afterLeave } = await a.from("participants").select("user_id").eq("session_id", s.id);
ok(afterLeave?.length === 1, "ayrılma sonrası katılımcı düştü");

await a.from("sessions").delete().eq("id", s.id);
const { data: gone } = await a.from("sessions").select("id").eq("id", s.id);
ok(gone?.length === 0, "temizlik (cascade delete)");

// prod endpoint
try {
  const res = await fetch(PROD + "/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic: "Ubudda kahve" }),
  });
  const data = await res.json();
  ok(res.ok && Array.isArray(data.cards) && data.cards.length > 0, `prod /api/cards (${data.cards?.length ?? 0} kart)`);
} catch (e) {
  ok(false, "prod /api/cards erişimi: " + e.message);
}

console.log(failed ? "\nSONUÇ: FAIL" : "\nSONUÇ: PASS");
process.exit(failed ? 1 : 0);
