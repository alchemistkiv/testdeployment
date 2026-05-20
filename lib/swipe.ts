// Kaydırma (swipe) için saf mantık — UI'dan bağımsız, test edilebilir.

export type SwipeDir = "like" | "pass" | "none";

/** Yatay sürükleme miktarına göre karar: eşiği aşarsa beğen/geç, değilse none. */
export function swipeDecision(dx: number, threshold = 110): SwipeDir {
  if (dx >= threshold) return "like";
  if (dx <= -threshold) return "pass";
  return "none";
}

/** Sürüklerken kartın hafif dönmesi için açı (derece), sınırlı. */
export function dragRotation(dx: number, max = 15): number {
  const r = dx / 12;
  return Math.max(-max, Math.min(max, r));
}

/** dx işaretine göre üstte gösterilecek ipucu. */
export function dragHint(dx: number, threshold = 60): SwipeDir {
  if (dx >= threshold) return "like";
  if (dx <= -threshold) return "pass";
  return "none";
}
