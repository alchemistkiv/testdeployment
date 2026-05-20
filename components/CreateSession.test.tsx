import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateSession } from "./CreateSession";

describe("CreateSession", () => {
  it("konu boşken 'Oturumu kur' pasif", () => {
    render(<CreateSession onCreate={() => {}} onBack={() => {}} />);
    expect(screen.getByRole("button", { name: /oturumu kur/i })).toBeDisabled();
  });

  it("geçerli konu + varsayılan eşik ile oturum kurar", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateSession onCreate={onCreate} onBack={() => {}} />);

    await user.type(
      screen.getByPlaceholderText(/Ubud/i),
      "Ubud'da kahve"
    );
    await user.click(screen.getByRole("button", { name: /oturumu kur/i }));

    expect(onCreate).toHaveBeenCalledWith({
      topic: "Ubud'da kahve",
      thresholdType: "majority",
      thresholdCount: null,
    });
  });

  it("'Belirli sayı' seçilince sayaç çıkar ve değeri iletilir", async () => {
    const onCreate = vi.fn();
    const user = userEvent.setup();
    render(<CreateSession onCreate={onCreate} onBack={() => {}} />);

    await user.type(screen.getByPlaceholderText(/Ubud/i), "Ne yesek");
    await user.click(screen.getByRole("button", { name: /belirli sayı/i }));
    await user.click(screen.getByRole("button", { name: "arttır" }));
    await user.click(screen.getByRole("button", { name: /oturumu kur/i }));

    expect(onCreate).toHaveBeenCalledWith({
      topic: "Ne yesek",
      thresholdType: "count",
      thresholdCount: 3,
    });
  });
});
