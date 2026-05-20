import { describe, expect, it } from "vitest";
import { dragHint, dragRotation, swipeDecision } from "./swipe";

describe("swipeDecision", () => {
  it("eşiği aşan sağ → like, sol → pass", () => {
    expect(swipeDecision(120)).toBe("like");
    expect(swipeDecision(-120)).toBe("pass");
  });
  it("eşik altı → none", () => {
    expect(swipeDecision(50)).toBe("none");
    expect(swipeDecision(-50)).toBe("none");
  });
});

describe("dragRotation", () => {
  it("dx ile orantılı ama sınırlı", () => {
    expect(dragRotation(0)).toBe(0);
    expect(dragRotation(120)).toBeCloseTo(10, 5);
    expect(dragRotation(100000)).toBe(15);
    expect(dragRotation(-100000)).toBe(-15);
  });
});

describe("dragHint", () => {
  it("daha düşük eşikte ipucu verir", () => {
    expect(dragHint(70)).toBe("like");
    expect(dragHint(-70)).toBe("pass");
    expect(dragHint(20)).toBe("none");
  });
});
