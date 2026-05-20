import { describe, expect, it } from "vitest";
import {
  generateJoinCode,
  requiredVotes,
  thresholdSummary,
  validateTopic,
} from "./session";

describe("generateJoinCode", () => {
  it("varsayılan 6 karakter üretir", () => {
    expect(generateJoinCode()).toHaveLength(6);
  });

  it("istenen uzunlukta üretir", () => {
    expect(generateJoinCode(4)).toHaveLength(4);
  });

  it("sadece karışmayan karakterler kullanır (0,O,1,I,L yok)", () => {
    for (let i = 0; i < 50; i++) {
      expect(generateJoinCode(10)).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]+$/);
    }
  });
});

describe("requiredVotes", () => {
  it("'all' tüm katılımcıları ister", () => {
    expect(requiredVotes("all", 4)).toBe(4);
  });

  it("'majority' yarıdan bir fazlasını ister", () => {
    expect(requiredVotes("majority", 4)).toBe(3);
    expect(requiredVotes("majority", 5)).toBe(3);
    expect(requiredVotes("majority", 1)).toBe(1);
  });

  it("'count' verilen sayıyı kullanır", () => {
    expect(requiredVotes("count", 6, 3)).toBe(3);
  });

  it("'count' katılımcı sayısını aşamaz", () => {
    expect(requiredVotes("count", 2, 9)).toBe(2);
  });

  it("0 katılımcıyı en az 1 sayar", () => {
    expect(requiredVotes("all", 0)).toBe(1);
  });
});

describe("validateTopic", () => {
  it("çok kısa konuyu reddeder", () => {
    expect(validateTopic("a")).toBe(false);
    expect(validateTopic("   ")).toBe(false);
  });

  it("anlamlı konuyu kabul eder", () => {
    expect(validateTopic("Ubud'da kahve")).toBe(true);
  });
});

describe("thresholdSummary", () => {
  it("her tip için okunur metin verir", () => {
    expect(thresholdSummary("all")).toMatch(/herkes/i);
    expect(thresholdSummary("majority")).toMatch(/çoğunluk/i);
    expect(thresholdSummary("count", 3)).toContain("3");
  });
});
