# Bali Choice

Gruplar için **Tinder tarzı ortak karar** uygulaması. Bir kişi konu + konum yazar
("Ubud'da sessiz bir akşam yemeği"), uygulama gerçek mekanları **kart** olarak üretir,
grup **kaydırır** (beğen/geç), yeterli kişi aynı kartı beğenince **realtime "Eşleşme!"**
bildirimi + konfeti düşer.

Detaylı ürün kararları: [`docs/urun-kararlari.md`](docs/urun-kararlari.md) ·
İlerleme/geçmiş: [`docs/ilerleme.md`](docs/ilerleme.md).

## Teknoloji

- **Next.js 15 (App Router) + React 19 + TypeScript** — frontend + API route.
- **DeepSeek** (`deepseek-chat`, OpenAI-uyumlu) — "beyin": serbest cümleyi yer +
  mekan türü + anahtar kelimelere çevirir (`lib/intent.ts`).
- **OpenStreetMap** (Nominatim geocode + Overpass) — "gözler": çevredeki gerçek
  mekanlar. Anahtar/kart gerekmez, $0 (`lib/osm.ts`).
- **Supabase** (Postgres + Realtime) — çok-cihaz oturum, oy, eşleşme (`lib/db.ts`).
- **Vercel** — deploy.
- **Kimlik:** auth yok; isim + üretilen uuid `localStorage`'da.

> Not: OSM'de mekan fotoğrafı/puanı/yorumu yoktur; kartlar metin ağırlıklıdır.
> Foto/puan istenirse kart-gerektiren bir kaynağa (Google/Foursquare) geçilir.

## Mimari akış

```
Kullanıcı cümlesi
   └─> /api/cards (sunucu)
         ├─ DeepSeek  → { near, kinds, keywords }
         └─ OSM       → gerçek mekan kartları
   └─> Supabase: kartlar + oylar + eşleşmeler (realtime)
   └─> Kaydırma + eşik (herkes/çoğunluk/N) → Eşleşme! + konfeti
```

## Kurulum

1. `npm install`
2. `.env.local` oluştur (commit edilmez):
   ```
   DEEPSEEK_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=https://<proje>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<publishable/anon key>
   ```
3. Supabase şemasını uygula: [`supabase/schema.sql`](supabase/schema.sql) → SQL Editor → Run.
4. `npm run dev` → http://localhost:3000

## Komutlar

| Komut | Açıklama |
|---|---|
| `npm run dev` | Yerel geliştirme |
| `npm run build` | Prod derleme |
| `npm test` | Birim testler (Vitest) |
| `node scripts/smoke.mjs` | Canlı duman testi (Supabase tam akış + realtime + prod /api/cards) |

## Deploy (Vercel)

Repo'yu Vercel'e bağla; env değişkenlerini (`DEEPSEEK_API_KEY`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) production'a ekle.
`NEXT_PUBLIC_*` build sırasında gömülür; env'ler build'den önce set olmalı.
