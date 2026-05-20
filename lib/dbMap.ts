// Supabase satır → uygulama tipi dönüşümleri. Saf fonksiyonlar (IO yok → test edilebilir).

import type { Card } from "./cards";
import type { Participant, Session, ThresholdType } from "./session";
import type { Vote } from "./match";

export type SessionRow = {
  id: string;
  code: string;
  topic: string;
  threshold_type: ThresholdType;
  threshold_count: number | null;
  host_user_id: string;
  created_at: string;
};

export function rowToSession(s: SessionRow, participants: Participant[]): Session {
  return {
    id: s.id,
    code: s.code,
    topic: s.topic,
    thresholdType: s.threshold_type,
    thresholdCount: s.threshold_count,
    hostUserId: s.host_user_id,
    createdAt: s.created_at,
    participants,
  };
}

export function rowToParticipant(p: Record<string, any>): Participant {
  return { userId: p.user_id, name: p.name };
}

export function rowToVote(v: Record<string, any>): Vote {
  return { userId: v.user_id, cardId: v.card_id, liked: v.liked };
}

export function rowToCard(r: Record<string, any>): Card {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? null,
    photoUrl: r.photo_url ?? null,
    rating: r.rating ?? null,
    priceLevel: r.price_level ?? null,
    distanceMeters: r.distance_m ?? null,
    address: r.address ?? null,
    openNow: r.open_now ?? null,
  };
}

/** Card → cards tablosu satırı (pozisyonlu). */
export function cardToRow(sessionId: string, c: Card, position: number) {
  return {
    session_id: sessionId,
    osm_id: c.id,
    position,
    name: c.name,
    category: c.category,
    photo_url: c.photoUrl,
    rating: c.rating,
    price_level: c.priceLevel,
    distance_m: c.distanceMeters,
    address: c.address,
    open_now: c.openNow,
  };
}
