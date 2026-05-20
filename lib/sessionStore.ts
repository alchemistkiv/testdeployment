"use client";

// Artık oturum Supabase'te (çok-cihaz). Bu cihazda yalnızca "hangi oturumdayım"
// işaretçisini (sessionId) tutuyoruz; oturumun kendisi DB'den yüklenir.

const KEY = "balichoice:sessionId";

export function rememberSession(sessionId: string) {
  try {
    window.localStorage.setItem(KEY, sessionId);
  } catch {
    // yoksay
  }
}

export function getStoredSessionId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearStoredSession() {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // yoksay
  }
}
