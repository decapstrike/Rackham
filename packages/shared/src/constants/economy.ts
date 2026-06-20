export const rewardRules = {
  correctXp: 10,
  correctWithHintXp: 6,
  recoveryXp: 7,
  questCompletionXp: 25,
  bossCompletionXp: 50,
  comebackBonusXp: 20,
  correctCoins: 5,
  correctWithHintCoins: 3,
  recoveryCoins: 4,
  questCompletionCoins: 20,
  perfectQuestBonusCoins: 25
} as const;

export const forgeUpgrades = [
  { key: "anvil", name: "Apprentice Anvil", cost: 50, maxLevel: 3 },
  { key: "furnace", name: "Fraction Furnace", cost: 75, maxLevel: 3 },
  { key: "crystal_lamp", name: "Decimal Crystal Lamp", cost: 100, maxLevel: 3 }
] as const;

export function xpRequiredForLevel(level: number): number {
  return 100 + (Math.max(1, level) - 1) * 50;
}

export function levelFromXp(totalXp: number): { level: number; xpIntoLevel: number; xpToNextLevel: number } {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  while (remaining >= xpRequiredForLevel(level)) {
    remaining -= xpRequiredForLevel(level);
    level += 1;
  }
  return { level, xpIntoLevel: remaining, xpToNextLevel: xpRequiredForLevel(level) };
}

export function answerReward(input: { isCorrect: boolean; hintsUsed: number; wasIncorrectThenCorrected?: boolean }) {
  if (!input.isCorrect) return { xp: 0, coins: 0 };
  // Recovery beats hint discount: the product should reward correction after a miss.
  if (input.wasIncorrectThenCorrected) return { xp: rewardRules.recoveryXp, coins: rewardRules.recoveryCoins };
  if (input.hintsUsed > 0) return { xp: rewardRules.correctWithHintXp, coins: rewardRules.correctWithHintCoins };
  return { xp: rewardRules.correctXp, coins: rewardRules.correctCoins };
}
