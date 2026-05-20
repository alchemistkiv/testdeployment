"use client";

// Oturumu şu an cihazda (localStorage) saklıyoruz — tek cihazda akışı görmek için.
// Çok-cihaz (arkadaşların katılması) + realtime için sonraki adımda Supabase'e taşınacak.
// O yüzden burayı küçük ve değiştirilebilir tutuyoruz.

import {
  generateJoinCode,
  type Participant,
  type Session,
  type ThresholdType,
} from "./session";

const STORAGE_KEY = "balichoice:session";

export type CreateSessionInput = {
  topic: string;
  thresholdType: ThresholdType;
  thresholdCount: number | null;
  host: Participant;
};

export function createSession(input: CreateSessionInput): Session {
  const session: Session = {
    id: crypto.randomUUID(),
    code: generateJoinCode(),
    topic: input.topic.trim(),
    thresholdType: input.thresholdType,
    thresholdCount: input.thresholdType === "count" ? input.thresholdCount : null,
    hostUserId: input.host.userId,
    createdAt: new Date().toISOString(),
    participants: [input.host],
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export function getCurrentSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
