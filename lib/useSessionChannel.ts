"use client";

import { useEffect } from "react";
import { subscribeTable } from "./db";

// Bir oturum tablosuna abone olur ve değişimde onChange çağırır; ilk açılışta
// da bir kez çalıştırır. Supabase env yoksa (ör. test) sessizce atlar.
// onChange durum okumamalı (her olayda DB'den taze çekip setState yapmalı) —
// bu yüzden bağımlılığa eklenmez.
export function useSessionChannel(
  table: "participants" | "votes" | "matches",
  sessionId: string,
  onChange: () => void
) {
  useEffect(() => {
    try {
      onChange();
      return subscribeTable(table, sessionId, onChange);
    } catch {
      // env yok → realtime atlanır
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, sessionId]);
}
