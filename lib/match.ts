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

/** Bu kullanıcının zaten oyladığı kartları çıkarır (kaldığı yerden devam). */
export function filterUnvoted<T extends { id: string }>(
  items: T[],
  votes: Vote[],
  userId: string
): T[] {
  const voted = new Set(
    votes.filter((v) => v.userId === userId).map((v) => v.cardId)
  );
  return items.filter((i) => !voted.has(i.id));
}

/** Destedeki tüm kartları oylamış (kaydırmayı bitirmiş) kullanıcıların id'leri. */
export function finishedUserIds(votes: Vote[], totalCards: number): string[] {
  if (totalCards <= 0) return [];
  const perUser: Record<string, Set<string>> = {};
  for (const v of votes) (perUser[v.userId] ??= new Set()).add(v.cardId);
  return Object.keys(perUser).filter((u) => perUser[u].size >= totalCards);
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
