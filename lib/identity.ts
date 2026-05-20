"use client";

import { useEffect, useState } from "react";

export type Identity = {
  name: string;
  userId: string;
};

const STORAGE_KEY = "balichoice:identity";

function readStorage(): Identity | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Identity>;
    if (parsed?.name && parsed?.userId) {
      return { name: parsed.name, userId: parsed.userId };
    }
  } catch {
    // bozuk veri varsa yok say
  }
  return null;
}

/**
 * İsmi kaydeder. uuid yoksa üretir (kişiyi benzersiz saymak için; isim çakışabilir).
 */
export function saveIdentity(name: string, existingUserId?: string): Identity {
  const identity: Identity = {
    name: name.trim(),
    userId: existingUserId ?? crypto.randomUUID(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(identity));
  return identity;
}

export function clearIdentity() {
  window.localStorage.removeItem(STORAGE_KEY);
}

/**
 * Kimliği okur ve günceller. `ready`, localStorage okunana kadar false
 * (sunucu/istemci uyumsuzluğunu önlemek için).
 */
export function useIdentity() {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setIdentity(readStorage());
    setReady(true);
  }, []);

  function save(name: string) {
    const next = saveIdentity(name, identity?.userId);
    setIdentity(next);
    return next;
  }

  function reset() {
    clearIdentity();
    setIdentity(null);
  }

  return { identity, ready, save, reset };
}
