import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CardFace } from "./CardFace";
import type { Card } from "@/lib/cards";

const base: Card = {
  id: "node/1",
  name: "Seniman Coffee",
  category: "Kafe",
  photoUrl: null,
  rating: null,
  priceLevel: null,
  distanceMeters: null,
  address: null,
  openNow: null,
};

describe("CardFace", () => {
  it("isim + kategoriyi gösterir", () => {
    render(<CardFace card={base} />);
    expect(screen.getByText("Seniman Coffee")).toBeInTheDocument();
    expect(screen.getByText("Kafe")).toBeInTheDocument();
  });

  it("foto yoksa kategori emojisi (placeholder) gösterir", () => {
    render(<CardFace card={base} />);
    expect(screen.getByText("☕")).toBeInTheDocument();
  });

  it("puan, fiyat, mesafe ve açık durumu varsa gösterir", () => {
    render(
      <CardFace
        card={{
          ...base,
          rating: 8.7,
          priceLevel: 2,
          distanceMeters: 540,
          openNow: true,
        }}
      />
    );
    expect(screen.getByText(/8\.7/)).toBeInTheDocument();
    expect(screen.getByText("$$")).toBeInTheDocument();
    expect(screen.getByText("540 m")).toBeInTheDocument();
    expect(screen.getByText("Açık")).toBeInTheDocument();
  });
});
