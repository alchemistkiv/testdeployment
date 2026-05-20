import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Lobby } from "./Lobby";
import type { Session } from "@/lib/session";

const session: Session = {
  id: "s1",
  code: "K7P2QX",
  topic: "Ubud'da kahve",
  thresholdType: "majority",
  thresholdCount: null,
  hostUserId: "u1",
  createdAt: new Date().toISOString(),
  participants: [{ userId: "u1", name: "Keko" }],
};

describe("Lobby", () => {
  it("konu, kod, eşik ve host'u gösterir", () => {
    render(<Lobby session={session} onClose={() => {}} />);
    expect(screen.getByText(/Ubud'da kahve/)).toBeInTheDocument();
    expect(screen.getByText("K7P2QX")).toBeInTheDocument();
    expect(screen.getByText(/çoğunluk/i)).toBeInTheDocument();
    expect(screen.getByText(/Keko/)).toBeInTheDocument();
  });
});
