// Oturum (session) modeli ve saf yardımcı fonksiyonlar.
// Burada DB/IO yok — sadece kurallar. Bu sayede kapsamlı test edilebilir.

export type ThresholdType = "all" | "majority" | "count";

export type Participant = {
  userId: string;
  name: string;
};

export type Session = {
  id: string;
  code: string;
  topic: string;
  thresholdType: ThresholdType;
  /** Sadece thresholdType === "count" iken anlamlı. */
  thresholdCount: number | null;
  hostUserId: string;
  createdAt: string;
  participants: Participant[];
};

// Karışması kolay karakterler (0/O, 1/I/L) çıkarıldı.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/** Paylaşılabilir, okunması kolay katılım kodu üretir (örn. "K7P2QX"). */
export function generateJoinCode(length = 6): string {
  const bytes = new Uint32Array(length);
  crypto.getRandomValues(bytes);
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return code;
}

/**
 * Bir kartın "eşleşme" sayılması için gereken beğeni sayısı.
 * Katılımcı sayısına göre hesaplanır.
 */
export function requiredVotes(
  thresholdType: ThresholdType,
  participantCount: number,
  thresholdCount?: number | null
): number {
  const total = Math.max(participantCount, 1);
  switch (thresholdType) {
    case "all":
      return total;
    case "majority":
      return Math.floor(total / 2) + 1;
    case "count": {
      const n = thresholdCount ?? total;
      return Math.min(Math.max(n, 1), total);
    }
  }
}

/** Konu cümlesi geçerli mi? (anlamlı bir ifade için en az 3 karakter) */
export function validateTopic(topic: string): boolean {
  return topic.trim().length >= 3;
}

/** Eşik seçimini kullanıcıya gösterilecek kısa metne çevirir. */
export function thresholdSummary(
  thresholdType: ThresholdType,
  thresholdCount?: number | null
): string {
  switch (thresholdType) {
    case "all":
      return "Herkes beğenince eşleşir";
    case "majority":
      return "Çoğunluk beğenince eşleşir";
    case "count":
      return `${thresholdCount ?? 2} kişi beğenince eşleşir`;
  }
}
