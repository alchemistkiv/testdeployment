import { describe, expect, it } from "vitest";
import {
  cardToRow,
  rowToCard,
  rowToParticipant,
  rowToSession,
  rowToVote,
  type SessionRow,
} from "./dbMap";
import type { Card } from "./cards";

describe("rowToSession", () => {
  it("DB satırını Session'a çevirir", () => {
    const row: SessionRow = {
      id: "s1",
      code: "K7P2QX",
      topic: "Ubud kahve",
      threshold_type: "majority",
      threshold_count: null,
      host_user_id: "u1",
      created_at: "2026-05-20T00:00:00Z",
    };
    const s = rowToSession(row, [{ userId: "u1", name: "Ali" }]);
    expect(s).toEqual({
      id: "s1",
      code: "K7P2QX",
      topic: "Ubud kahve",
      thresholdType: "majority",
      thresholdCount: null,
      hostUserId: "u1",
      createdAt: "2026-05-20T00:00:00Z",
      participants: [{ userId: "u1", name: "Ali" }],
    });
  });
});

describe("rowToParticipant / rowToVote", () => {
  it("snake_case → camelCase", () => {
    expect(rowToParticipant({ user_id: "u1", name: "Ali" })).toEqual({
      userId: "u1",
      name: "Ali",
    });
    expect(rowToVote({ user_id: "u1", card_id: "c1", liked: true })).toEqual({
      userId: "u1",
      cardId: "c1",
      liked: true,
    });
  });
});

describe("rowToCard / cardToRow", () => {
  it("kart satırını Card'a çevirir, eksikleri null'a düşürür", () => {
    expect(
      rowToCard({
        id: "c1",
        name: "Seniman",
        category: "Kafe",
        photo_url: null,
        rating: null,
        price_level: null,
        distance_m: 540,
        address: "Ubud",
        open_now: null,
      })
    ).toEqual({
      id: "c1",
      name: "Seniman",
      category: "Kafe",
      photoUrl: null,
      rating: null,
      priceLevel: null,
      distanceMeters: 540,
      address: "Ubud",
      openNow: null,
    });
  });

  it("cardToRow round-trip alanları korur", () => {
    const card: Card = {
      id: "node/1",
      name: "Maha",
      category: "Kafe",
      photoUrl: null,
      rating: null,
      priceLevel: null,
      distanceMeters: 100,
      address: null,
      openNow: null,
    };
    const row = cardToRow("s1", card, 3);
    expect(row.session_id).toBe("s1");
    expect(row.osm_id).toBe("node/1");
    expect(row.position).toBe(3);
    expect(row.name).toBe("Maha");
    expect(row.distance_m).toBe(100);
  });
});
