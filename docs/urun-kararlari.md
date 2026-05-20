# Ürün Kararları

Bu dosya, uygulamanın ne olduğunu ve neden bu şekilde tasarlandığını kaydeder.
Konuşarak aldığımız kararların kalıcı kaydıdır.

## 1. Vizyon

Gruplar için **Tinder tarzı ortak karar** uygulaması. Klasik "nereye gidelim / ne
yiyelim?" tartışmasını, herkesin kart kaydırıp ortak beğeniyi (eşleşmeyi) bulmasıyla
çözer. Eğlenceli, hızlı ve "fazla seçenek" hissini koruyan bir deneyim.

Örnek senaryo: Kullanıcı "Ubud'da, şu caddedeyiz, kahve içeceğiz" der. Uygulama o
çevredeki kafeleri gerçek fotoğraf ve kritik bilgileriyle kart olarak çıkarır; grup
kaydırır; ortak beğeni çıkınca eşleşme bildirilir.

## 2. Temel mekanik (v1 çekirdeği)

1. **Oturum aç:** konu + konum (örn. "Ubud / kahve").
2. **Kartları otomatik üret:** elle seçenek girmek yok — sistem doldurur.
3. **Kaydır:** her üye beğen/geç yapar.
4. **Eşleşme:** herkes (veya eşik kadar kişi) aynı kartı beğenince realtime
   "match!" bildirimi.

> Not: Kaydırmanın değeri **bol ve otomatik gelen seçenek**. Elle tek tek seçenek
> girmek bu deneyimi öldürür — bu yüzden otomatik doldurma v1'in çekirdeğidir.

## 3. Kartlar nereden gelir? (motor kararı)

Hibrit yaklaşım — iki motorun güçlü yanını birleştirir:

| Motor | Görevi | Foto | Maliyet |
|---|---|---|---|
| **Foursquare Places API** | Konuma göre gerçek mekan + foto + puan + fiyat + mesafe | ✅ Gerçek | Ücretsiz kota |
| **Claude API / Agent SDK** | İsteği anlar, Places'i araç olarak çağırır, süzer/sıralar, mekan-dışı öneri üretir | ❌ | Çok ucuz |

**Karar:** Claude = beyin (orkestratör), Foursquare = gözler (gerçek foto + veri).

### Neden Claude tek başına yetmez?
Claude (LLM) gerçek bir mekanın fotoğrafını üretmez; web'den bulduğu resim linkleri
güvenilmezdir (yanlış/bozuk olabilir). Gerçek fotoğraf için mekan API'si şarttır.
Claude bu API'yi bir **araç** olarak çağırır; kullanıcı sadece doğal cümlesini yazar.

## 4. Maliyet / Claude kredisi notu

İki ayrı "cüzdan" var, karıştırılmamalı:

- **Sohbet aboneliği** (claude.ai + Claude Code terminal): interaktif kullanım.
  Kendi uygulamanın sunucu çağrılarını **kapsamaz**.
- **Programatik kredi havuzu** (15 Haziran 2026'dan itibaren): Max 5x ≈ **$100/ay**,
  Agent SDK / üçüncü-parti uygulamalar için. Tam API fiyatından düşer, devretmez.
- **Direkt API anahtarı** (console.anthropic.com): ayrı, kullandıkça öde; yeni
  hesaba ufak ücretsiz kredi.

Pratikte hobi ölçeğinde her iki yol da neredeyse bedava (öneri çağrısı kuruşun altı).

## 5. Aşamalı yol haritası

- **v1:** Çekirdek mekanik — oturum, otomatik kart (Foursquare), kaydırma, eşleşme,
  realtime bildirim. Claude ile temel süzme/sıralama.
- **v2:** Claude'un rolünü derinleştir — grup tercihlerine göre kişiselleştirme,
  mekan-dışı kararlar ("bu akşam ne yapsak?"), öneri kalitesi.
- **v3 (opsiyonel):** Manuel kart ekleme, foto yükleme, geçmiş oturumlar, profiller.

## 6. Teknoloji yığını

Next.js 15 + React 19 + TypeScript · Supabase (Postgres + realtime + auth + storage)
· Vercel (deploy) · Foursquare Places API · Claude API / Agent SDK.

## 7. Çözülen kararlar

- **Eşleşme eşiği:** Oturum kurulurken seçilir — "herkes" / "çoğunluk" /
  "ilk N kişi". Oturumu açan belirler.
- **Konum girişi:** Serbest **semantik cümle** ("Ubud'da şu caddede sessiz bir
  kahve"). GPS yok. Claude cümleden konum + niyet + kriterleri ayıklar, Foursquare'e
  geçirir. Not: serbest metinle cadde düzeyi hassasiyet sınırlı; semt/bölge düzeyi
  güvenilir.
- **Kullanıcı kimliği:** Auth yok. Kullanıcı bir **isim** girer; isim + arka planda
  üretilen benzersiz **uuid** `localStorage`'a yazılır. uuid kaydırmaları kişi-bazında
  saymak için (isim çakışmalarına karşı). Cache temizlenirse kimlik sıfırlanır —
  v1 için kabul edilebilir.

## 8. Maliyet kısıtı: $0 ekstra

Kullanıcı ek ödeme yapmayacak. Plan buna uygun:
- Supabase / Vercel → ücretsiz katman, kart istemez.
- Claude → mevcut Max 5x aboneliğinin programatik havuzu (ekstra ödeme yok).
- Foursquare → ücretsiz katman (kart gerekip gerekmediği bağlanırken teyit edilecek;
  gerekirse kartsız alternatife düşülür, foto kalitesi pahasına).
