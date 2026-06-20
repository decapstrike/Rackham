export function nextDifficulty(current: number, result: { streakCorrect: number; streakIncorrect: number; usedHint: boolean }): number {
  if (result.streakCorrect >= 3 && !result.usedHint) return Math.min(5, current + 1);
  if (result.streakIncorrect >= 2) return Math.max(1, current - 1);
  return Math.min(5, Math.max(1, current));
}

export function masteryScore(input: { attempts: number; correct: number; noHintCorrect?: number; challengeCorrect?: number }): number {
  if (input.attempts === 0) return 0;
  const recentAccuracy = input.correct / input.attempts;
  const noHintAccuracy = (input.noHintCorrect ?? input.correct) / input.attempts;
  const challengeAccuracy = (input.challengeCorrect ?? 0) / Math.max(1, Math.ceil(input.attempts * 0.25));
  const consistencyScore = input.attempts >= 5 ? Math.min(1, recentAccuracy + 0.1) : recentAccuracy * 0.8;
  return Math.max(0, Math.min(1, 0.5 * recentAccuracy + 0.2 * noHintAccuracy + 0.15 * challengeAccuracy + 0.15 * consistencyScore));
}
