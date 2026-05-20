import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NameScreen } from "./NameScreen";

describe("NameScreen", () => {
  it("isim 2 harften kısayken buton pasif", () => {
    render(<NameScreen onSubmit={() => {}} />);
    expect(screen.getByRole("button", { name: /başla/i })).toBeDisabled();
  });

  it("geçerli isim girilince onSubmit çağrılır", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<NameScreen onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText("Adın..."), "Keko");
    await user.click(screen.getByRole("button", { name: /başla/i }));

    expect(onSubmit).toHaveBeenCalledWith("Keko");
  });
});
