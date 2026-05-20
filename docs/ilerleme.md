# İlerleme

Bali Choice — grupça kaydır, eşleş, birlikte karar ver. Her adımın durumu burada.

Karar ve gerekçeler için: `docs/urun-kararlari.md`.

## Durum özeti

| Adım | Açıklama | Durum |
|---|---|---|
| 1 | İskelet + kimlik (isim + uuid, localStorage) | ✅ Bitti |
| 2 | Ana ekran + oturum kurma + eşik seçimi | ✅ Bitti |
| 3 | Kart üretimi (DeepSeek + OpenStreetMap) | ✅ Çalışıyor (foto kısıtı: aşağıya bak) |
| 4 | Kaydırma (swipe) UI | ✅ Çalışıyor (jest tarayıcıda doğrulanmalı) |
| 5 | Eşleşme + realtime + konfeti | 🔧 Temel hazır; Supabase projesi bekleniyor |

## Adım 1 — İskelet + kimlik ✅

- Tailwind v4 + Poppins ile eğlenceli, mobil-öncelikli tema (`app/globals.css`, `app/layout.tsx`).
- İsim girme ekranı (`components/NameScreen.tsx`).
- Kimlik: isim + gizli `uuid`, `localStorage`'da (`lib/identity.ts`). Auth yok.

## Adım 5 — Eşleşme + realtime + konfeti 🔧

- **Hazır (test edilebilir):** Eşleşme mantığı `lib/match.ts` (kart başına benzersiz
  beğeni sayar, eşiğe ulaşanları bulur) + testleri. Konfeti `components/Confetti.tsx`
  (bağımlılıksız). DB şeması `supabase/schema.sql`.
- **Bekleyen (Supabase gerekiyor):** Oturum/oy/eşleşmeyi localStorage yerine
  Supabase'e taşımak, koda katılma akışı, realtime "match!" aboneliği, eşleşmede
  konfeti. Bunlar canlı Supabase ile test edilecek.
- **Senden:** ücretsiz Supabase projesi (kart istemez) → `schema.sql`'i çalıştır →
  `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`'i `.env.local`'a koy.

## Adım 4 — Kaydırma (swipe) UI ✅

- `components/SwipeDeck.tsx`: kartları tek tek gösterir; sağa beğen / sola geç
  (sürükle + ❤️/✖️ butonları), ilerleme sayacı, sürükleme ipucu (BEĞEN/GEÇ),
  bitince beğenilenlerin özeti + "baştan kaydır".
- `components/CardFace.tsx`: kartın görsel yüzü; foto yoksa kategori emojili şık
  placeholder (`categoryEmoji`).
- Saf swipe mantığı `lib/swipe.ts` (`swipeDecision`, `dragRotation`, `dragHint`)
  ayrı ve test edildi.
- **Not:** Sürükleme jesti bu başsız ortamda elle test edilemedi; Vercel preview /
  gerçek tarayıcıda denenmeli. Buton akışı ve mantık test/build'de doğrulandı.
- Tek cihazda bu kullanıcının beğenileri toplanır; **grup eşleşmesi + realtime
  5. adımda** (Supabase) gelecek.

## Adım 3 — Kart üretimi ✅ (foto kısıtlı)

- **Kategoriler genişledi:** yeme-içme + **konaklama** (otel/pansiyon/hostel) +
  **aktivite** (gezilecek yer/müze/manzara/park/spa). DeepSeek bu türleri seçer,
  `lib/osm.ts` her türü OSM etiket seçicisine açar.
- **Güvenilirlik:** Overpass `around` poligonlarda timeout/504 veriyordu →
  **bounding-box** sorgusuna geçildi (hızlı, stabil). Ayrıca HTTP 200 içindeki
  `remark` timeout'u hata sayılıyor ve birden çok Overpass sunucusu sırayla deneniyor.
- **Yorum/puan yok:** OSM'de rating/yorum/foto olmadığından "en iyi" sıralama ve
  yorum gösterimi bu kaynakta mümkün değil (kullanıcı $0/kartsızı seçti). İleride
  foto/yorum istenirse kart-gerektiren kaynak (Google/Foursquare) gerekecek.


- **Beyin DeepSeek** (Claude yerine): `deepseek-chat` (= `deepseek-v4-flash`),
  OpenAI-uyumlu API. Serbest cümleden `near` + OSM `kinds` + `keywords` ayıklar
  (`lib/intent.ts`). Canlı doğrulandı.
- **Gözler OpenStreetMap** (`lib/osm.ts`): Nominatim ile yer adı → koordinat,
  Overpass ile çevredeki mekanlar. **Anahtar/kart/kayıt gerekmez, $0.** Foursquare'den
  vazgeçildi (ücretsiz tier'ı bile kart/billing istiyordu — 429).
- Ham OSM element → Card dönüşümü saf ve test edilmiş (`lib/cards.ts`): isim, kategori
  (mutfak), adres, mesafe (haversine). Foto/puan/fiyat OSM'de genelde yok → null.
- API route `POST /api/cards`: cümle → DeepSeek → OSM → kart listesi. Anahtar (DeepSeek)
  yalnızca sunucuda.
- UI: Lobby "Kartları getir" aktif; `components/Cards.tsx` kartları gösterir (foto
  varsa foto, yoksa şık placeholder). Kaydırma 4. adımda.
- **Bilinen kısıt:** OSM'de mekan fotoğrafı neredeyse hiç yok (Ubud testinde 15/15
  fotosuz). "Fotoğrafa kaydır" hissi için ileride foto kaynağı (kart-gerektiren
  Foursquare/Google ya da foto zenginleştirme) gerekecek — kullanıcı $0/kartsızı seçti.

## Adım 2 — Oturum kurma + eşik ✅

- Ana ekran / hub (`components/HomeHub.tsx`): "Yeni oturum başlat" (+ "Koda katıl" yakında).
- Oturum kurma (`components/CreateSession.tsx`): semantik cümle + 3 gamify eşik
  seçeneği (Herkes / Çoğunluk / Belirli sayı + sayaç).
- Lobi (`components/Lobby.tsx`): konu, eşik özeti, paylaşılabilir katılım kodu
  (dokun-kopyala), katılımcı listesi, "Kartları getir" (3. adım).
- Oturum mantığı (`lib/session.ts`): kod üretimi, gereken-oy hesabı, doğrulama, özet.
- Oturum şu an cihazda saklanıyor (`lib/sessionStore.ts`). **Çok-cihaz katılımı +
  realtime için Supabase sonraki adımlarda bağlanacak.**

## Test

- Çerçeve: Vitest + Testing Library (jsdom). Çalıştır: `npm test`.
- Kapsam: oturum mantığı (kod/oy/doğrulama/özet), kimlik (kaydet/koru/sil),
  bileşen etkileşimleri (NameScreen, CreateSession eşik+sayaç, Lobby render).
- Durum: **28/28 test geçiyor**, `npm run build` temiz.

## Bilinen sınırlar / sonraki işler

- Oturum tek cihazda (localStorage) — arkadaşların farklı cihazdan katılması için
  Supabase gerekiyor (3.–5. adımlarda).
- UI tarayıcıda gözle henüz doğrulanmadı; Vercel preview'da bakılacak.
- "Bali Choice" ismi placeholder; değiştirilebilir.

## Canlı görmek için kurulum (ücretsiz, kart gerektirmez)

1. `npm install && npm run dev` → http://localhost:3000
2. Supabase projesi (sonraki adımda gerekecek): ücretsiz katman, kart istemez.
