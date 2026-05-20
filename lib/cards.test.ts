import { describe, expect, it } from "vitest";
import {
  fsqPlaceToCard,
  formatDistance,
  photoUrlFromParts,
  priceLabel,
} from "./cards";

describe("photoUrlFromParts", () => {
  it("birleştirir prefix + boyut + suffix", () => {
    expect(photoUrlFromParts("https://x/img/", "/a.jpg", "400x400")).toBe(
      "https://x/img/400x400/a.jpg"
    );
  });
  it("parça eksikse null", () => {
    expect(photoUrlFromParts(null, "/a.jpg")).toBeNull();
    expect(photoUrlFromParts("https://x/", null)).toBeNull();
  });
});

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

describe("fsqPlaceToCard", () => {
  it("ham Foursquare mekanını Card'a çevirir", () => {
    const card = fsqPlaceToCard({
      fsq_place_id: "abc123",
      name: "Seniman Coffee",
      location: { formatted_address: "Jl. Sriwedari, Ubud" },
      categories: [{ name: "Coffee Shop" }],
      rating: 8.7,
      price: 2,
      distance: 540,
      hours: { open_now: true },
      photos: [{ prefix: "https://fastly.4sqi.net/img/general/", suffix: "/x.jpg" }],
    });
    expect(card).toEqual({
      fsqId: "abc123",
      name: "Seniman Coffee",
      category: "Coffee Shop",
      photoUrl: "https://fastly.4sqi.net/img/general/600x600/x.jpg",
      rating: 8.7,
      priceLevel: 2,
      distanceMeters: 540,
      address: "Jl. Sriwedari, Ubud",
      openNow: true,
    });
  });

  it("eksik alanlarda null'a düşer ve fsq_id fallback'i çalışır", () => {
    const card = fsqPlaceToCard({ fsq_id: "legacy1", name: "X" });
    expect(card.fsqId).toBe("legacy1");
    expect(card.photoUrl).toBeNull();
    expect(card.rating).toBeNull();
    expect(card.openNow).toBeNull();
    expect(card.category).toBeNull();
  });
});
