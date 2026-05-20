// Eşleşme mantığı — saf, IO yok, kapsamlı test edilebilir.
// Bir kart, beğeni sayısı eşiğe ulaşınca "eşleşme" olur (kişi başına tek oy sayılır).

import { requiredVotes, type ThresholdType } from "./session";

export type Vote = {
  userId: string;
  cardId: string;
  liked: boolean;
};

/** Kart başına benzersiz beğenen kişi sayısı (geçenler ve mükerrer oylar elenir). */
export function likeCountsByCard(votes: Vote[]): Record<string, number> {
  const perCard: Record<string, Set<string>> = {};
  for (const v of votes) {
    if (!v.liked) continue;
    (perCard[v.cardId] ??= new Set()).add(v.userId);
  }
  const counts: Record<string, number> = {};
  for (const cardId of Object.keys(perCard)) {
    counts[cardId] = perCard[cardId].size;
  }
  return counts;
}

/** Eşiğe ulaşan kartların id'leri (beğeni sayısına göre azalan sırada). */
export function matchedCardIds(
  votes: Vote[],
  thresholdType: ThresholdType,
  participantCount: number,
  thresholdCount?: number | null
): string[] {
  const required = requiredVotes(thresholdType, participantCount, thresholdCount);
  const counts = likeCountsByCard(votes);
  return Object.entries(counts)
    .filter(([, n]) => n >= required)
    .sort((a, b) => b[1] - a[1])
    .map(([cardId]) => cardId);
}
