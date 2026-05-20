"use client";

import { useEffect, useState } from "react";
import { useIdentity } from "@/lib/identity";
import {
  clearStoredSession,
  getStoredSessionId,
  rememberSession,
} from "@/lib/sessionStore";
import { createSessionDb, joinSessionDb, loadSession } from "@/lib/db";
import type { Session } from "@/lib/session";
import { NameScreen } from "@/components/NameScreen";
import { HomeHub } from "@/components/HomeHub";
import { CreateSession } from "@/components/CreateSession";
import { JoinSession } from "@/components/JoinSession";
import { Lobby } from "@/components/Lobby";
import { Cards } from "@/components/Cards";

type Screen = "home" | "create" | "join";

function Spinner() {
  return (
    <main className="bg-party flex min-h-dvh items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-white" />
    </main>
  );
}

export default function Home() {
  const { identity, ready, save, reset } = useIdentity();
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [showCards, setShowCards] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [busy, setBusy] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // Açılışta: bu cihaz bir oturumda mıydı? DB'den geri yükle.
  useEffect(() => {
    if (!ready) return;
    const id = getStoredSessionId();
    if (!id) {
      setRestoring(false);
      return;
    }
    loadSession(id)
      .then((s) => {
        if (s) setSession(s);
        else clearStoredSession();
      })
      .catch(() => {})
      .finally(() => setRestoring(false));
  }, [ready]);

  if (!ready || restoring) return <Spinner />;

  if (!identity) {
    return <NameScreen onSubmit={(name) => save(name)} />;
  }

  if (session) {
    if (showCards) {
      return (
        <Cards
          session={session}
          userId={identity.userId}
          onBack={() => setShowCards(false)}
        />
      );
    }
    return (
      <Lobby
        session={session}
        onFetchCards={() => setShowCards(true)}
        onClose={() => {
          clearStoredSession();
          setSession(null);
          setShowCards(false);
          setScreen("home");
        }}
      />
    );
  }

  if (busy) return <Spinner />;

  if (screen === "create") {
    return (
      <CreateSession
        onBack={() => setScreen("home")}
        onCreate={async (input) => {
          setBusy(true);
          try {
            const created = await createSessionDb({
              ...input,
              host: { userId: identity.userId, name: identity.name },
            });
            rememberSession(created.id);
            setSession(created);
            setScreen("home");
          } catch {
            setBusy(false);
          }
        }}
      />
    );
  }

  if (screen === "join") {
    return (
      <JoinSession
        busy={busy}
        error={joinError}
        onBack={() => {
          setJoinError(null);
          setScreen("home");
        }}
        onJoin={async (code) => {
          setBusy(true);
          setJoinError(null);
          try {
            const joined = await joinSessionDb(code, {
              userId: identity.userId,
              name: identity.name,
            });
            rememberSession(joined.id);
            setSession(joined);
            setScreen("home");
          } catch (e) {
            setJoinError(e instanceof Error ? e.message : "Katılınamadı.");
          } finally {
            setBusy(false);
          }
        }}
      />
    );
  }

  return (
    <HomeHub
      name={identity.name}
      onCreate={() => setScreen("create")}
      onJoin={() => setScreen("join")}
      onReset={reset}
    />
  );
}
