"use client";

import { useEffect, useState } from "react";
import { useIdentity } from "@/lib/identity";
import {
  clearSession,
  createSession,
  getCurrentSession,
} from "@/lib/sessionStore";
import type { Session } from "@/lib/session";
import { NameScreen } from "@/components/NameScreen";
import { HomeHub } from "@/components/HomeHub";
import { CreateSession } from "@/components/CreateSession";
import { Lobby } from "@/components/Lobby";

type Screen = "home" | "create";

export default function Home() {
  const { identity, ready, save, reset } = useIdentity();
  const [session, setSession] = useState<Session | null>(null);
  const [screen, setScreen] = useState<Screen>("home");

  useEffect(() => {
    if (ready) setSession(getCurrentSession());
  }, [ready]);

  if (!ready) {
    return (
      <main className="bg-party flex min-h-dvh items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/40 border-t-white" />
      </main>
    );
  }

  if (!identity) {
    return <NameScreen onSubmit={(name) => save(name)} />;
  }

  if (session) {
    return (
      <Lobby
        session={session}
        onClose={() => {
          clearSession();
          setSession(null);
          setScreen("home");
        }}
      />
    );
  }

  if (screen === "create") {
    return (
      <CreateSession
        onBack={() => setScreen("home")}
        onCreate={(input) => {
          const created = createSession({
            ...input,
            host: { userId: identity.userId, name: identity.name },
          });
          setSession(created);
          setScreen("home");
        }}
      />
    );
  }

  return (
    <HomeHub
      name={identity.name}
      onCreate={() => setScreen("create")}
      onReset={reset}
    />
  );
}
