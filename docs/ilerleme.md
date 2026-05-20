# İlerleme

Bali Choice — grupça kaydır, eşleş, birlikte karar ver. Her adımın durumu burada.

Karar ve gerekçeler için: `docs/urun-kararlari.md`.

## Durum özeti

| Adım | Açıklama | Durum |
|---|---|---|
| 1 | İskelet + kimlik (isim + uuid, localStorage) | ✅ Bitti |
| 2 | Ana ekran + oturum kurma + eşik seçimi | ✅ Bitti |
| 3 | Kart üretimi (DeepSeek + Foursquare) | 🔧 Kodu hazır; geçerli Foursquare key bekleniyor |
| 4 | Kaydırma UI | ⬜ Bekliyor |
| 5 | Eşleşme + realtime + konfeti | ⬜ Bekliyor |

## Adım 1 — İskelet + kimlik ✅

- Tailwind v4 + Poppins ile eğlenceli, mobil-öncelikli tema (`app/globals.css`, `app/layout.tsx`).
- İsim girme ekranı (`components/NameScreen.tsx`).
- Kimlik: isim + gizli `uuid`, `localStorage`'da (`lib/identity.ts`). Auth yok.

## Adım 3 — Kart üretimi 🔧

- **Beyin DeepSeek'e geçti** (Claude yerine): `deepseek-chat` (= `deepseek-v4-flash`),
  OpenAI-uyumlu API. Serbest cümleden konum + arama anahtarı + fiyat/açıklık/sıralama
  ayıklar (`lib/intent.ts`). Canlı test edildi, doğru çalışıyor.
- **Gözler Foursquare** (`lib/foursquare.ts`): yeni Places API
  (`places-api.foursquare.com`, `X-Places-Api-Version: 2025-06-17`, Bearer Service Key).
  Legacy v3 kapatıldı (410). Ham mekan → Card dönüşümü saf ve test edilmiş (`lib/cards.ts`).
- API route `POST /api/cards` (`app/api/cards/route.ts`): cümle → DeepSeek → Foursquare →
  kart listesi. Anahtarlar yalnızca sunucuda.
- UI: Lobby'deki "Kartları getir" aktif; `components/Cards.tsx` foto + puan + fiyat +
  mesafe + açık/kapalı ile kartları gösterir (kaydırma 4. adımda).
- **Engel:** geçerli bir Foursquare **Service API Key** gerekiyor (panelde
  "Generate Service API Key"). Eldeki key 401 veriyor.

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
