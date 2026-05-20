import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { JoinSession } from "./JoinSession";

describe("JoinSession", () => {
  it("kod 4 karakterden kısaysa 'Katıl' pasif", () => {
    render(
      <JoinSession onJoin={() => {}} onBack={() => {}} busy={false} error={null} />
    );
    expect(screen.getByRole("button", { name: /katıl/i })).toBeDisabled();
  });

  it("geçerli kodu büyük harfe çevirip onJoin'e iletir", async () => {
    const onJoin = vi.fn();
    const user = userEvent.setup();
    render(
      <JoinSession onJoin={onJoin} onBack={() => {}} busy={false} error={null} />
    );

    await user.type(screen.getByPlaceholderText("K7P2QX"), "k7p2qx");
    await user.click(screen.getByRole("button", { name: /katıl/i }));

    expect(onJoin).toHaveBeenCalledWith("K7P2QX");
  });

  it("hata mesajını gösterir", () => {
    render(
      <JoinSession
        onJoin={() => {}}
        onBack={() => {}}
        busy={false}
        error="Bu koda ait oturum bulunamadı."
      />
    );
    expect(
      screen.getByText(/oturum bulunamadı/i)
    ).toBeInTheDocument();
  });
});
