# İlerleme

Bali Choice — grupça kaydır, eşleş, birlikte karar ver. Her adımın durumu burada.

Karar ve gerekçeler için: `docs/urun-kararlari.md`.

## Durum özeti

| Adım | Açıklama | Durum |
|---|---|---|
| 1 | İskelet + kimlik (isim + uuid, localStorage) | ✅ Bitti |
| 2 | Ana ekran + oturum kurma + eşik seçimi | ✅ Bitti |
| 3 | Kart üretimi (Claude + Foursquare) | ⏳ Sırada |
| 4 | Kaydırma UI | ⬜ Bekliyor |
| 5 | Eşleşme + realtime + konfeti | ⬜ Bekliyor |

## Adım 1 — İskelet + kimlik ✅

- Tailwind v4 + Poppins ile eğlenceli, mobil-öncelikli tema (`app/globals.css`, `app/layout.tsx`).
- İsim girme ekranı (`components/NameScreen.tsx`).
- Kimlik: isim + gizli `uuid`, `localStorage`'da (`lib/identity.ts`). Auth yok.

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
- Durum: **20/20 test geçiyor**, `npm run build` temiz.

## Bilinen sınırlar / sonraki işler

- Oturum tek cihazda (localStorage) — arkadaşların farklı cihazdan katılması için
  Supabase gerekiyor (3.–5. adımlarda).
- UI tarayıcıda gözle henüz doğrulanmadı; Vercel preview'da bakılacak.
- "Bali Choice" ismi placeholder; değiştirilebilir.

## Canlı görmek için kurulum (ücretsiz, kart gerektirmez)

1. `npm install && npm run dev` → http://localhost:3000
2. Supabase projesi (sonraki adımda gerekecek): ücretsiz katman, kart istemez.
