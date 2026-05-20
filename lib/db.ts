"use client";

// Supabase veri katmanı: oturum/katılımcı/kart/oy/eşleşme + realtime abonelikler.
// Tüm çağrılar tarayıcıda publishable (anon) key ile çalışır; RLS v1'de açık.

import { getSupabase } from "./supabase";
import type { Card } from "./cards";
import {
  generateJoinCode,
  type Participant,
  type Session,
  type ThresholdType,
} from "./session";
import type { Vote } from "./match";

type SessionRow = {
  id: string;
  code: string;
  topic: string;
  threshold_type: ThresholdType;
  threshold_count: number | null;
  host_user_id: string;
  created_at: string;
};

function rowToSession(s: SessionRow, participants: Participant[]): Session {
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

export async function listParticipants(sessionId: string): Promise<Participant[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("participants")
    .select("user_id,name")
    .eq("session_id", sessionId)
    .order("joined_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((p) => ({ userId: p.user_id, name: p.name }));
}

export async function createSessionDb(input: {
  topic: string;
  thresholdType: ThresholdType;
  thresholdCount: number | null;
  host: Participant;
}): Promise<Session> {
  const sb = getSupabase();
  const base = {
    topic: input.topic.trim(),
    threshold_type: input.thresholdType,
    threshold_count: input.thresholdType === "count" ? input.thresholdCount : null,
    host_user_id: input.host.userId,
  };

  // Join kodu benzersiz olmalı; nadir çakışmada (Postgres 23505) yeni kodla dene.
  let created: SessionRow | null = null;
  let lastError: unknown = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    const { data: s, error } = await sb
      .from("sessions")
      .insert({ ...base, code: generateJoinCode() })
      .select()
      .single();
    if (!error) {
      created = s as SessionRow;
      break;
    }
    lastError = error;
    if ((error as { code?: string }).code !== "23505") break;
  }
  if (!created) throw lastError;

  const { error: pErr } = await sb
    .from("participants")
    .insert({ session_id: created.id, user_id: input.host.userId, name: input.host.name });
  if (pErr) throw pErr;
  return rowToSession(created, [input.host]);
}

export async function joinSessionDb(
  code: string,
  participant: Participant
): Promise<Session> {
  const sb = getSupabase();
  const { data: s, error } = await sb
    .from("sessions")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .maybeSingle();
  if (error) throw error;
  if (!s) throw new Error("Bu koda ait oturum bulunamadı.");
  const { error: pErr } = await sb
    .from("participants")
    .upsert(
      { session_id: s.id, user_id: participant.userId, name: participant.name },
      { onConflict: "session_id,user_id" }
    );
  if (pErr) throw pErr;
  return rowToSession(s as SessionRow, await listParticipants(s.id));
}

export async function loadSession(sessionId: string): Promise<Session | null> {
  const sb = getSupabase();
  const { data: s } = await sb
    .from("sessions")
    .select("*")
    .eq("id", sessionId)
    .maybeSingle();
  if (!s) return null;
  return rowToSession(s as SessionRow, await listParticipants(sessionId));
}

// --- Kartlar ---

export async function saveCards(sessionId: string, cards: Card[]): Promise<void> {
  if (cards.length === 0) return;
  const sb = getSupabase();
  const rows = cards.map((c, i) => ({
    session_id: sessionId,
    osm_id: c.id,
    position: i,
    name: c.name,
    category: c.category,
    photo_url: c.photoUrl,
    rating: c.rating,
    price_level: c.priceLevel,
    distance_m: c.distanceMeters,
    address: c.address,
    open_now: c.openNow,
  }));
  const { error } = await sb
    .from("cards")
    .upsert(rows, { onConflict: "session_id,osm_id", ignoreDuplicates: true });
  if (error) throw error;
}

/** Karları DB'den yükler; id artık DB uuid'i (oylar buna referans verir). */
export async function loadCards(sessionId: string): Promise<Card[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("cards")
    .select("*")
    .eq("session_id", sessionId)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    photoUrl: r.photo_url,
    rating: r.rating,
    priceLevel: r.price_level,
    distanceMeters: r.distance_m,
    address: r.address,
    openNow: r.open_now,
  }));
}

// --- Oylar & eşleşmeler ---

export async function castVote(
  sessionId: string,
  cardId: string,
  userId: string,
  liked: boolean
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("votes")
    .upsert(
      { session_id: sessionId, card_id: cardId, user_id: userId, liked },
      { onConflict: "session_id,card_id,user_id" }
    );
  if (error) throw error;
}

export async function loadVotes(sessionId: string): Promise<Vote[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("votes")
    .select("user_id,card_id,liked")
    .eq("session_id", sessionId);
  if (error) throw error;
  return (data ?? []).map((v) => ({
    userId: v.user_id,
    cardId: v.card_id,
    liked: v.liked,
  }));
}

export async function recordMatch(sessionId: string, cardId: string): Promise<void> {
  const sb = getSupabase();
  await sb
    .from("matches")
    .upsert(
      { session_id: sessionId, card_id: cardId },
      { onConflict: "session_id,card_id", ignoreDuplicates: true }
    );
}

export async function loadMatches(sessionId: string): Promise<string[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("matches")
    .select("card_id")
    .eq("session_id", sessionId);
  if (error) throw error;
  return (data ?? []).map((m) => m.card_id);
}

// --- Realtime abonelikler (değişimde callback) ---

export function subscribeTable(
  table: "participants" | "votes" | "matches",
  sessionId: string,
  onChange: () => void
): () => void {
  const sb = getSupabase();
  const channel = sb
    .channel(`${table}:${sessionId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter: `session_id=eq.${sessionId}` },
      () => onChange()
    )
    .subscribe();
  return () => {
    sb.removeChannel(channel);
  };
}
