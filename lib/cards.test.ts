import { describe, expect, it } from "vitest";
import {
  categoryEmoji,
  mapsSearchUrl,
  formatDistance,
  haversineMeters,
  osmAddress,
  osmCategory,
  osmElementToCard,
  osmPhoto,
  priceLabel,
} from "./cards";

describe("priceLabel", () => {
  it("1–4 → $ işaretleri", () => {
    expect(priceLabel(1)).toBe("$");
    expect(priceLabel(3)).toBe("$$$");
  });
  it("aralık dışı / yok → null", () => {
    expect(priceLabel(0)).toBeNull();
    expect(priceLabel(5)).toBeNull();
    expect(priceLabel(null)).toBeNull();
  });
});

describe("formatDistance", () => {
  it("metre / kilometre formatlar", () => {
    expect(formatDistance(320)).toBe("320 m");
    expect(formatDistance(1240)).toBe("1.2 km");
  });
  it("geçersiz → null", () => {
    expect(formatDistance(null)).toBeNull();
    expect(formatDistance(-5)).toBeNull();
  });
});

describe("haversineMeters", () => {
  it("yakın iki nokta arası makul mesafe verir", () => {
    const d = haversineMeters(-8.5069, 115.2625, -8.5067323, 115.2651985);
    expect(d).toBeGreaterThan(250);
    expect(d).toBeLessThan(350);
  });
  it("aynı nokta → 0", () => {
    expect(haversineMeters(40, 29, 40, 29)).toBeCloseTo(0, 5);
  });
});

describe("osmCategory", () => {
  it("mutfak öncelikli ve okunur", () => {
    expect(osmCategory({ cuisine: "coffee_shop;breakfast" })).toBe("Coffee shop");
  });
  it("mutfak yoksa tür etiketi (amenity/tourism/leisure, TR)", () => {
    expect(osmCategory({ amenity: "restaurant" })).toBe("Restoran");
    expect(osmCategory({ amenity: "cafe" })).toBe("Kafe");
    expect(osmCategory({ tourism: "hotel" })).toBe("Otel");
    expect(osmCategory({ tourism: "attraction" })).toBe("Gezilecek yer");
    expect(osmCategory({ leisure: "park" })).toBe("Park");
  });
  it("hiçbiri yoksa null", () => {
    expect(osmCategory({})).toBeNull();
  });
});

describe("osmAddress", () => {
  it("sokak + numara + şehir birleştirir", () => {
    expect(
      osmAddress({
        "addr:street": "Jalan Sri Wedari",
        "addr:housenumber": "5",
        "addr:city": "Ubud",
      })
    ).toBe("Jalan Sri Wedari 5, Ubud");
  });
  it("eksikse elde olanı / null verir", () => {
    expect(osmAddress({ "addr:city": "Ubud" })).toBe("Ubud");
    expect(osmAddress({})).toBeNull();
  });
});

describe("osmPhoto", () => {
  it("doğrudan image URL'i", () => {
    expect(osmPhoto({ image: "https://x/p.jpg" })).toBe("https://x/p.jpg");
  });
  it("wikimedia_commons → FilePath URL'i", () => {
    expect(osmPhoto({ wikimedia_commons: "File:Foo bar.jpg" })).toBe(
      "https://commons.wikimedia.org/wiki/Special:FilePath/Foo%20bar.jpg?width=600"
    );
  });
  it("foto yoksa null", () => {
    expect(osmPhoto({})).toBeNull();
    expect(osmPhoto({ image: "not-a-url" })).toBeNull();
  });
});

describe("mapsSearchUrl", () => {
  it("isim + adresten arama URL'i kurar", () => {
    const u = mapsSearchUrl({ name: "Seniman Coffee", address: "Ubud" });
    expect(u).toBe(
      "https://www.google.com/maps/search/?api=1&query=Seniman%20Coffee%20Ubud"
    );
  });
  it("adres yoksa sadece ismi kullanır", () => {
    expect(mapsSearchUrl({ name: "Maha" })).toContain("query=Maha");
  });
});

describe("categoryEmoji", () => {
  it("kategoriye göre emoji seçer", () => {
    expect(categoryEmoji("Kafe")).toBe("☕");
    expect(categoryEmoji("Restoran")).toBe("🍽️");
    expect(categoryEmoji("Otel")).toBe("🏨");
    expect(categoryEmoji("Müze")).toBe("🏛️");
  });
  it("bilinmeyende varsayılan pin", () => {
    expect(categoryEmoji(null)).toBe("📍");
    expect(categoryEmoji("xyz")).toBe("📍");
  });
});

describe("osmElementToCard", () => {
  const center = { lat: -8.5069, lon: 115.2625 };

  it("node etiketlerini Card'a çevirir + mesafe hesaplar", () => {
    const card = osmElementToCard(
      {
        type: "node",
        id: 1726069192,
        lat: -8.5067323,
        lon: 115.2651985,
        tags: {
          name: "Seniman Coffee Studio",
          amenity: "cafe",
          cuisine: "coffee_shop",
          "addr:street": "Jalan Sri Wedari",
          "addr:housenumber": "5",
          "addr:city": "Ubud",
        },
      },
      center
    );
    expect(card.id).toBe("node/1726069192");
    expect(card.name).toBe("Seniman Coffee Studio");
    expect(card.category).toBe("Coffee shop");
    expect(card.address).toBe("Jalan Sri Wedari 5, Ubud");
    expect(card.photoUrl).toBeNull();
    expect(card.rating).toBeNull();
    expect(card.priceLevel).toBeNull();
    expect(card.openNow).toBeNull();
    expect(card.distanceMeters).toBeGreaterThan(250);
    expect(card.distanceMeters).toBeLessThan(350);
  });

  it("way için center koordinatını kullanır", () => {
    const card = osmElementToCard(
      {
        type: "way",
        id: 42,
        center: { lat: -8.5069, lon: 115.2625 },
        tags: { name: "Some Resto", amenity: "restaurant" },
      },
      center
    );
    expect(card.id).toBe("way/42");
    expect(card.distanceMeters).toBe(0);
  });
});
