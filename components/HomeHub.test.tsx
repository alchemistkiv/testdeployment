import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HomeHub } from "./HomeHub";

describe("HomeHub", () => {
  it("ismi gösterir", () => {
    render(
      <HomeHub name="Keko" onCreate={() => {}} onJoin={() => {}} onReset={() => {}} />
    );
    expect(screen.getByText("Keko")).toBeInTheDocument();
  });

  it("butonlar doğru callback'leri çağırır", async () => {
    const onCreate = vi.fn();
    const onJoin = vi.fn();
    const onReset = vi.fn();
    const user = userEvent.setup();
    render(
      <HomeHub name="Keko" onCreate={onCreate} onJoin={onJoin} onReset={onReset} />
    );

    await user.click(screen.getByRole("button", { name: /yeni oturum başlat/i }));
    await user.click(screen.getByRole("button", { name: /koda katıl/i }));
    await user.click(screen.getByRole("button", { name: /ismi değiştir/i }));

    expect(onCreate).toHaveBeenCalledOnce();
    expect(onJoin).toHaveBeenCalledOnce();
    expect(onReset).toHaveBeenCalledOnce();
  });
});
