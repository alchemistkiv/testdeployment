import { describe, expect, it } from "vitest";
import {
  filterUnvoted,
  likeCountsByCard,
  matchedCardIds,
  type Vote,
} from "./match";

const votes: Vote[] = [
  { userId: "u1", cardId: "a", liked: true },
  { userId: "u2", cardId: "a", liked: true },
  { userId: "u3", cardId: "a", liked: true },
  { userId: "u1", cardId: "b", liked: true },
  { userId: "u2", cardId: "b", liked: false },
  { userId: "u1", cardId: "b", liked: true }, // mükerrer → tek sayılır
  { userId: "u2", cardId: "c", liked: true },
];

describe("likeCountsByCard", () => {
  it("kişi başına tekilleştirir ve geçenleri elemez sadece beğenileri sayar", () => {
    expect(likeCountsByCard(votes)).toEqual({ a: 3, b: 1, c: 1 });
  });
  it("boş girişte boş", () => {
    expect(likeCountsByCard([])).toEqual({});
  });
});

describe("filterUnvoted", () => {
  const cards = [{ id: "a" }, { id: "b" }, { id: "c" }];
  it("kullanıcının oyladığı kartları çıkarır", () => {
    const v: Vote[] = [
      { userId: "u1", cardId: "a", liked: true },
      { userId: "u1", cardId: "b", liked: false },
      { userId: "u2", cardId: "c", liked: true }, // başka kullanıcı sayılmaz
    ];
    expect(filterUnvoted(cards, v, "u1").map((c) => c.id)).toEqual(["c"]);
  });
  it("oy yoksa hepsi kalır", () => {
    expect(filterUnvoted(cards, [], "u1")).toHaveLength(3);
  });
});

describe("matchedCardIds", () => {
  it("'herkes' (3 kişi): sadece 3 beğeni alan kart eşleşir", () => {
    expect(matchedCardIds(votes, "all", 3)).toEqual(["a"]);
  });
  it("'çoğunluk' (3 kişi → 2): 2+ beğeni alan kartlar", () => {
    const v: Vote[] = [
      { userId: "u1", cardId: "x", liked: true },
      { userId: "u2", cardId: "x", liked: true },
      { userId: "u1", cardId: "y", liked: true },
    ];
    expect(matchedCardIds(v, "majority", 3)).toEqual(["x"]);
  });
  it("'belirli sayı' (2): eşiğe ulaşanlar beğeniye göre sıralı", () => {
    expect(matchedCardIds(votes, "count", 3, 2)).toEqual(["a"]);
  });
  it("hiç eşleşme yoksa boş", () => {
    expect(matchedCardIds([], "all", 4)).toEqual([]);
  });
});
