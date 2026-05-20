# İlerleme

Bali Choice — grupça kaydır, eşleş, birlikte karar ver. Her adımın durumu burada.

Karar ve gerekçeler için: `docs/urun-kararlari.md`.

## Durum özeti

| Adım | Açıklama | Durum |
|---|---|---|
| 1 | İskelet + kimlik (isim + uuid, localStorage) | ✅ Bitti |
| 2 | Ana ekran + oturum kurma + eşik seçimi | ✅ Bitti |
| 3 | Kart üretimi (DeepSeek + OpenStreetMap) | ✅ Çalışıyor (foto kısıtı: aşağıya bak) |
| 4 | Kaydırma UI | ⬜ Bekliyor |
| 5 | Eşleşme + realtime + konfeti | ⬜ Bekliyor |

## Adım 1 — İskelet + kimlik ✅

- Tailwind v4 + Poppins ile eğlenceli, mobil-öncelikli tema (`app/globals.css`, `app/layout.tsx`).
- İsim girme ekranı (`components/NameScreen.tsx`).
- Kimlik: isim + gizli `uuid`, `localStorage`'da (`lib/identity.ts`). Auth yok.

## Adım 3 — Kart üretimi ✅ (foto kısıtlı)

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
