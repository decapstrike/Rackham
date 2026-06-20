import {
  answerReward,
  buildDailyQuestPlan,
  checkAnswer,
  DEFAULT_FOCUS_SKILL_ID,
  forgeUpgrades,
  generateProblem,
  levelFromXp,
  masteryScore,
  rewardRules,
  skillDomains,
  skills,
  validateDailyQuestPlan,
  type ChildProfile,
  type ChildSkillProgress,
  type ForgeUpgrade,
  type ProblemAttempt,
  type Quest,
  type RewardInventory,
  type AvatarKey,
  type Theme,
  type TutorTone
} from "@mathforge/shared";
import { personalizeQuest } from "./ai/questPersonalization.js";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

export type Store = {
  children: Map<string, ChildProfile>;
  rewards: Map<string, RewardInventory>;
  progress: Map<string, ChildSkillProgress>;
  quests: Map<string, Quest>;
  attempts: Map<string, ProblemAttempt>;
  forge: Map<string, ForgeUpgrade[]>;
};

export const store: Store = {
  children: new Map(),
  rewards: new Map(),
  progress: new Map(),
  quests: new Map(),
  attempts: new Map(),
  forge: new Map()
};

export function createChildProfile(input: {
  displayName: string;
  gradeLevel: number;
  interests?: string[];
  avatarKey?: AvatarKey;
  preferredTheme: Theme;
  tutorTone: TutorTone;
  dailyGoalMinutes: number;
}) {
  const timestamp = now();
  const childProfile: ChildProfile = { id: id("child"), createdAt: timestamp, updatedAt: timestamp, ...input, interests: input.interests ?? [], avatarKey: input.avatarKey ?? "ember_smith" };
  store.children.set(childProfile.id, childProfile);
  store.rewards.set(childProfile.id, {
    id: id("inventory"),
    childProfileId: childProfile.id,
    coins: 0,
    xp: 0,
    level: 1,
    unlockedItems: [],
    equippedItems: []
  });
  for (const skill of skills) {
    store.progress.set(`${childProfile.id}:${skill.id}`, {
      id: id("progress"),
      childProfileId: childProfile.id,
      skillId: skill.id,
      level: 1,
      xp: 0,
      masteryScore: 0,
      attempts: 0,
      correct: 0,
      streakCorrect: 0,
      streakIncorrect: 0,
      currentDifficulty: 1
    });
  }
  store.forge.set(childProfile.id, []);
  return childProfile;
}

export function getHome(childProfileId: string) {
  const child = requireChild(childProfileId);
  const inventory = requireInventory(childProfileId);
  const level = levelFromXp(inventory.xp);
  const existingDaily = [...store.quests.values()].find((quest) => quest.childProfileId === childProfileId && quest.questType === "daily" && quest.status !== "completed");
  return {
    child: {
      id: child.id,
      displayName: child.displayName,
      level: level.level,
      xp: level.xpIntoLevel,
      xpToNextLevel: level.xpToNextLevel,
      coins: inventory.coins
    },
    dailyQuest: {
      available: true,
      questId: existingDaily?.id,
      title: existingDaily?.title ?? "Daily MathForge Quest",
      presentation: existingDaily?.presentation,
      estimatedMinutes: child.dailyGoalMinutes,
      focusSkill: "Equivalent Fractions"
    },
    skillProgress: skills.slice(0, 8).map((skill) => {
      const progress = store.progress.get(`${childProfileId}:${skill.id}`)!;
      return { skillId: skill.id, name: skill.name, level: progress.level, masteryScore: progress.masteryScore };
    }),
    forge: { upgrades: store.forge.get(childProfileId) ?? [] },
    domains: skillDomains
  };
}

export async function createDailyQuest(childProfileId: string, preferredLength = 8) {
  const child = requireChild(childProfileId);
  const plan = buildDailyQuestPlan();
  if (preferredLength !== 8 || !validateDailyQuestPlan(plan)) {
    throw new Error("Daily quest must contain exactly 5 focus, 2 review, and 1 challenge problems.");
  }
  const focusSkill = skills.find((skill) => skill.id === DEFAULT_FOCUS_SKILL_ID) ?? skills[0];
  const presentation = await personalizeQuest({ child, focusSkill, questLength: plan.length });
  const quest: Quest = {
    id: id("quest"),
    childProfileId,
    questType: "daily",
    title: presentation.title,
    flavorText: presentation.flavor,
    presentation,
    focusSkillId: DEFAULT_FOCUS_SKILL_ID,
    status: "in_progress",
    startedAt: now(),
    totalProblems: plan.length,
    correctProblems: 0,
    xpEarned: 0,
    coinsEarned: 0
  };
  store.quests.set(quest.id, quest);
  plan.forEach((item, index) => {
    const generated = generateProblem(item.problemType, { difficulty: item.difficulty, seed: index });
    const attempt: ProblemAttempt = {
      ...generated,
      id: id("attempt"),
      questId: quest.id,
      childProfileId,
      hintsUsed: 0,
      createdAt: now(),
      metadata: { ...generated.metadata, questRole: item.role, order: index + 1 }
    };
    store.attempts.set(attempt.id, attempt);
  });
  return quest;
}

export function getNextProblem(questId: string) {
  requireQuest(questId);
  const attempts = attemptsForQuest(questId);
  const next = attempts.find((attempt) => attempt.isCorrect !== true);
  if (!next) return null;
  return publicProblem(next, attempts.indexOf(next), attempts.length);
}

export function submitAnswer(attemptId: string, submittedAnswer: string, timeSpentSeconds?: number) {
  const attempt = requireAttempt(attemptId);
  const quest = requireQuest(attempt.questId);
  if (attempt.isCorrect === true) {
    return {
      isCorrect: true,
      correctAnswer: attempt.correctAnswer,
      feedback: {
        message: feedbackFor(attempt, attempt.submittedAnswer ?? submittedAnswer, true),
        tone: "positive"
      },
      rewardPreview: { xp: 0, coins: 0 },
      hintAvailable: false,
      nextAction: "continue"
    };
  }
  const wasWrongBefore = attempt.isCorrect === false;
  const isCorrect = checkAnswer(attempt, submittedAnswer);
  attempt.submittedAnswer = submittedAnswer;
  attempt.isCorrect = isCorrect;
  attempt.timeSpentSeconds = timeSpentSeconds;
  attempt.answeredAt = now();

  const reward = answerReward({ isCorrect, hintsUsed: attempt.hintsUsed, wasIncorrectThenCorrected: wasWrongBefore && isCorrect });
  if (isCorrect) {
    quest.xpEarned += reward.xp;
    quest.coinsEarned += reward.coins;
    quest.correctProblems = attemptsForQuest(quest.id).filter((item) => item.isCorrect === true).length;
    updateProgress(attempt, reward.xp);
  }

  return {
    isCorrect,
    correctAnswer: attempt.correctAnswer,
    feedback: {
      message: feedbackFor(attempt, submittedAnswer, isCorrect),
      tone: isCorrect ? "positive" : "scaffold"
    },
    rewardPreview: reward,
    hintAvailable: !isCorrect,
    nextAction: isCorrect ? "continue" : "retry"
  };
}

export function requestHint(attemptId: string, hintLevel: number) {
  const attempt = requireAttempt(attemptId);
  const level = Math.min(3, Math.max(1, hintLevel));
  attempt.hintsUsed = Math.max(attempt.hintsUsed, level);
  return { hint: { level, message: attempt.hintSequence[level - 1] } };
}

export function completeQuest(questId: string) {
  const quest = requireQuest(questId);
  const attempts = attemptsForQuest(questId);
  if (attempts.some((attempt) => attempt.isCorrect !== true)) {
    throw new Error("Quest cannot be completed until every problem is answered correctly.");
  }
  if (quest.status !== "completed") {
    quest.status = "completed";
    quest.completedAt = now();
    quest.xpEarned += rewardRules.questCompletionXp;
    quest.coinsEarned += rewardRules.questCompletionCoins;
    if (quest.correctProblems === quest.totalProblems) quest.coinsEarned += rewardRules.perfectQuestBonusCoins;
    const inventory = requireInventory(quest.childProfileId);
    inventory.xp += quest.xpEarned;
    inventory.coins += quest.coinsEarned;
    inventory.level = levelFromXp(inventory.xp).level;
  }
  const bySkill = new Map<string, { attempts: number; correct: number }>();
  for (const attempt of attempts) {
    const current = bySkill.get(attempt.skillId) ?? { attempts: 0, correct: 0 };
    current.attempts += 1;
    current.correct += attempt.isCorrect ? 1 : 0;
    bySkill.set(attempt.skillId, current);
  }
  return {
    questSummary: {
      questId: quest.id,
      totalProblems: quest.totalProblems,
      correctProblems: quest.correctProblems,
      xpEarned: quest.xpEarned,
      coinsEarned: quest.coinsEarned,
      skillsPracticed: [...bySkill].map(([skillId, stats]) => ({
        skillId,
        name: skills.find((skill) => skill.id === skillId)?.name ?? skillId,
        attempts: stats.attempts,
        correct: stats.correct,
        masteryDelta: Number((stats.correct / stats.attempts * 0.1).toFixed(2))
      }))
    },
    rewards: {
      levelUp: false,
      coins: quest.coinsEarned,
      unlockedItems: []
    },
    message: "Quest complete. The Fraction Furnace is glowing again."
  };
}

export function buyForgeUpgrade(childProfileId: string, upgradeKey: string) {
  const inventory = requireInventory(childProfileId);
  const config = forgeUpgrades.find((upgrade) => upgrade.key === upgradeKey);
  if (!config) throw new Error("Unknown forge upgrade.");
  const upgrades = store.forge.get(childProfileId) ?? [];
  const existing = upgrades.find((upgrade) => upgrade.upgradeKey === upgradeKey);
  const nextLevel = (existing?.level ?? 0) + 1;
  if (nextLevel > config.maxLevel) throw new Error("Upgrade is already max level.");
  if (inventory.coins < config.cost) throw new Error("Not enough coins.");
  inventory.coins -= config.cost;
  if (existing) existing.level = nextLevel;
  else upgrades.push({ id: id("upgrade"), childProfileId, upgradeKey, upgradeName: config.name, level: 1, purchasedAt: now() });
  store.forge.set(childProfileId, upgrades);
  return { inventory, upgrades };
}

export function parentSummary(childProfileId: string) {
  requireChild(childProfileId);
  const quests = [...store.quests.values()].filter((quest) => quest.childProfileId === childProfileId && quest.status === "completed");
  const attempts = [...store.attempts.values()].filter((attempt) => attempt.childProfileId === childProfileId && attempt.answeredAt);
  const totalProblems = attempts.length;
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const skillStats = skills.map((skill) => {
    const skillAttempts = attempts.filter((attempt) => attempt.skillId === skill.id);
    const skillCorrect = skillAttempts.filter((attempt) => attempt.isCorrect).length;
    return { skill, attempts: skillAttempts.length, accuracy: skillAttempts.length ? skillCorrect / skillAttempts.length : 0 };
  }).filter((item) => item.attempts > 0);
  const strongSkills = skillStats.filter((item) => item.accuracy >= 0.75).map((item) => item.skill.name).slice(0, 2);
  const needsPractice = skillStats.filter((item) => item.accuracy < 0.75).map((item) => item.skill.name).slice(0, 2);
  return {
    period: "7d",
    sessionsCompleted: quests.length,
    totalProblems,
    accuracy: totalProblems ? Number((correct / totalProblems).toFixed(2)) : 0,
    minutesPracticed: quests.length * 10,
    strongSkills,
    needsPractice: needsPractice.length ? needsPractice : ["Adding Fractions with Unlike Denominators"],
    summary: totalProblems
      ? `Practice is moving. ${correct} of ${totalProblems} problems are correct, with the next best focus on ${needsPractice[0] ?? "fraction fluency"}.`
      : "No completed quest yet. The first daily quest will give a clearer read on strengths and practice needs.",
    recommendedNextQuest: {
      title: "Common Denominator Repair Run",
      focusSkillId: "skill_add_fractions_unlike_denominators"
    }
  };
}

function updateProgress(attempt: ProblemAttempt, xp: number) {
  const key = `${attempt.childProfileId}:${attempt.skillId}`;
  const progress = store.progress.get(key);
  if (!progress) return;
  progress.attempts += 1;
  progress.correct += 1;
  progress.xp += xp;
  progress.level = levelFromXp(progress.xp).level;
  progress.streakCorrect += 1;
  progress.streakIncorrect = 0;
  progress.masteryScore = masteryScore({ attempts: progress.attempts, correct: progress.correct });
  progress.lastPracticedAt = now();
}

function feedbackFor(attempt: ProblemAttempt, submittedAnswer: string, isCorrect: boolean) {
  if (isCorrect) return `Nice. ${attempt.explanation}`;
  return `Close, but the forge is not hot yet. ${attempt.hintSequence[0]}`;
}

function publicProblem(attempt: ProblemAttempt, index: number, total: number) {
  const { correctAnswer, explanation, hintSequence, ...safeProblem } = attempt;
  return {
    ...safeProblem,
    progress: { current: index + 1, total },
    skillName: skills.find((skill) => skill.id === attempt.skillId)?.name ?? "Math"
  };
}

function attemptsForQuest(questId: string) {
  return [...store.attempts.values()].filter((attempt) => attempt.questId === questId).sort((a, b) => Number(a.metadata.order) - Number(b.metadata.order));
}

function requireChild(childProfileId: string) {
  const child = store.children.get(childProfileId);
  if (!child) throw new Error("Child profile not found.");
  return child;
}

function requireInventory(childProfileId: string) {
  const inventory = store.rewards.get(childProfileId);
  if (!inventory) throw new Error("Reward inventory not found.");
  return inventory;
}

function requireQuest(questId: string) {
  const quest = store.quests.get(questId);
  if (!quest) throw new Error("Quest not found.");
  return quest;
}

function requireAttempt(attemptId: string) {
  const attempt = store.attempts.get(attemptId);
  if (!attempt) throw new Error("Problem attempt not found.");
  return attempt;
}
