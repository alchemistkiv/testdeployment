import { beforeEach, describe, expect, it } from "vitest";
import { clearIdentity, saveIdentity } from "./identity";

describe("identity localStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("ismi kaydeder ve uuid üretir", () => {
    const id = saveIdentity(" Keko ");
    expect(id.name).toBe("Keko");
    expect(id.userId).toMatch(/[0-9a-f-]{36}/);
  });

  it("mevcut uuid'i korur", () => {
    const first = saveIdentity("Ali");
    const second = saveIdentity("Ali Yeni", first.userId);
    expect(second.userId).toBe(first.userId);
    expect(second.name).toBe("Ali Yeni");
  });

  it("clearIdentity kaydı siler", () => {
    saveIdentity("Ali");
    clearIdentity();
    expect(window.localStorage.getItem("balichoice:identity")).toBeNull();
  });
});
