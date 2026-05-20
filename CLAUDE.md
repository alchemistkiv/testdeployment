# CLAUDE.md

Bu dosya, bu repoda çalışan Claude (ve geliştiriciler) için projenin özetini ve
çalışma kurallarını içerir.

## Ürün nedir?

Gruplar için **Tinder tarzı ortak karar uygulaması**. "Nereye gidelim / ne yiyelim /
ne yapalım?" sorusunu kaydırarak çözer:

- Bir kullanıcı bir **oturum** açar (örn. "Ubud'da kahve").
- Uygulama o konu + konuma uygun **kartları** otomatik üretir (gerçek mekan,
  gerçek fotoğraf, kritik bilgiler: puan, fiyat, mesafe, açık mı).
- Gruptaki herkes kartları **kaydırır** (beğen / geç).
- Herkesin (veya çoğunluğun) beğendiği bir kart çıkınca **eşleşme (match!)**
  realtime olarak tüm gruba bildirilir.

Detaylı kararlar ve gerekçeler: `docs/urun-kararlari.md`.

## Teknoloji yığını

- **Next.js 15 (App Router) + React 19 + TypeScript** — frontend + API routes.
- **Supabase** — Postgres veritabanı, realtime (eşleşme bildirimi), auth, storage.
- **Vercel** — deploy.
- **Kimlik:** Auth yok; kullanıcı ismi + üretilen uuid `localStorage`'da tutulur.
- **Foursquare Places API** — konuma göre gerçek mekanları fotoğraf + bilgiyle çeker
  (kartların "gözü"; gerçek fotoğraf kaynağı).
- **Claude API / Agent SDK** — orkestratör/"beyin": kullanıcının isteğini anlar,
  Places API'sini araç olarak çağırır, sonuçları kritere göre süzer/sıralar,
  mekan-dışı ("ne yapsak?") konularda öneri üretir.

## Mimari özet (önemli incelik)

Kullanıcı sadece "Ubud'da kahve, bu cadde, sessiz olsun" der. Arka planda:
**Claude = beyin (anlar + süzer), Foursquare = gözler (gerçek foto + veri).**
Claude tek başına gerçek fotoğraf üretmez/güvenilir bulamaz; fotoğraf hep mekan
API'sinden gelir.

## Geliştirme

- `npm run dev` — yerel geliştirme.
- `npm run build` — prod derleme.
- Ortam değişkenleri için `.env.example`'a bak; gizli anahtarlar `.env.local`'da
  (commit edilmez).

## Kurallar

- Gereksiz soyutlama / erken optimizasyon yok; v1 kapsamına sadık kal.
- Sırlar repoya girmez (`.env*.local` gitignore'da).
- Türkçe iletişim; kod ve kimlikler İngilizce.
