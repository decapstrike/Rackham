import {
  answerReward,
  buildDailyQuestPlan,
  checkAnswer,
  DEFAULT_FOCUS_SKILL_ID,
  SUBJECT_IDS,
  activityTemplates,
  forgeUpgrades,
  generateActivity,
  levelFromXp,
  masteryScore,
  rewardRules,
  skillDomains,
  skills,
  subjects,
  validateDailyQuestPlan,
  validateActivityAnswer,
  type ActivityType,
  type ChildProfile,
  type ChildSkillProgress,
  type GeneratedActivity,
  type ForgeUpgrade,
  type ProblemAttempt,
  type Quest,
  type RewardInventory,
  type AvatarKey,
  type Theme,
  type TutorTone
} from "@learningforge/shared";
import { personalizeQuest } from "./ai/questPersonalization.js";

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

type ActivityAttempt = GeneratedActivity & {
  id: string;
  questId: string;
  childProfileId: string;
  problemType?: ActivityType;
  submittedAnswer?: string;
  isCorrect?: boolean;
  hintsUsed: number;
  timeSpentSeconds?: number;
  createdAt: string;
  answeredAt?: string;
};

export type Store = {
  children: Map<string, ChildProfile>;
  studentProfiles: Map<string, ChildProfile>;
  rewards: Map<string, RewardInventory>;
  progress: Map<string, ChildSkillProgress>;
  quests: Map<string, Quest>;
  attempts: Map<string, ActivityAttempt>;
  activityAttempts: Map<string, ActivityAttempt>;
  forge: Map<string, ForgeUpgrade[]>;
};

const profiles = new Map<string, ChildProfile>();
const attempts = new Map<string, ActivityAttempt>();

export const store: Store = {
  children: profiles,
  studentProfiles: profiles,
  rewards: new Map(),
  progress: new Map(),
  quests: new Map(),
  attempts,
  activityAttempts: attempts,
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

export const createStudentProfile = createChildProfile;

export function getSubjects() {
  return subjects;
}

export function getSubject(subjectId: string) {
  const subject = subjects.find((item) => item.id === subjectId || item.slug === subjectId);
  if (!subject) throw new Error("Subject not found.");
  return subject;
}

export function getHome(childProfileId: string) {
  const child = requireChild(childProfileId);
  const inventory = requireInventory(childProfileId);
  const level = levelFromXp(inventory.xp);
  const existingDaily = [...store.quests.values()].find((quest) => quest.childProfileId === childProfileId && quest.questType === "daily" && quest.status !== "completed");
  const activeSubjectSummaries = subjects.filter((subject) => subject.status === "active").map((subject) => {
    const subjectSkills = skills.filter((skill) => skill.subjectId === subject.id);
    const progressItems = subjectSkills.map((skill) => store.progress.get(`${childProfileId}:${skill.id}`)).filter((item): item is ChildSkillProgress => Boolean(item));
    const mastery = progressItems.length ? progressItems.reduce((sum, item) => sum + item.masteryScore, 0) / progressItems.length : 0;
    const xp = progressItems.reduce((sum, item) => sum + item.xp, 0);
    return {
      subjectId: subject.id,
      key: subject.slug,
      name: subject.name,
      roomName: subject.roomName,
      masteryScore: Number(mastery.toFixed(2)),
      level: levelFromXp(xp).level
    };
  });
  const dailyQuest = {
    available: true,
    questId: existingDaily?.id,
    title: existingDaily?.title ?? "Daily LearningForge Quest",
    presentation: existingDaily?.presentation,
    estimatedMinutes: child.dailyGoalMinutes,
    primarySubject: "Mixed",
    focusSkill: "Equivalent Fractions"
  };
  return {
    child: {
      id: child.id,
      displayName: child.displayName,
      level: level.level,
      xp: level.xpIntoLevel,
      xpToNextLevel: level.xpToNextLevel,
      coins: inventory.coins
    },
    dailyQuest,
    recommendedQuest: dailyQuest,
    subjects: activeSubjectSummaries,
    skillProgress: skills.slice(0, 8).map((skill) => {
      const progress = store.progress.get(`${childProfileId}:${skill.id}`)!;
      return { skillId: skill.id, name: skill.name, level: progress.level, masteryScore: progress.masteryScore };
    }),
    forge: { upgrades: store.forge.get(childProfileId) ?? [] },
    domains: skillDomains
  };
}

export const getStudentHome = getHome;

export async function createDailyQuest(childProfileId: string, preferredLength = 8) {
  return createRecommendedDailyQuest(childProfileId, preferredLength, "auto");
}

export async function createRecommendedDailyQuest(studentProfileId: string, preferredLength = 8, subjectPreference = "auto") {
  if (subjectPreference !== "auto") {
    return createSubjectDailyQuest(studentProfileId, subjectPreference, preferredLength);
  }
  const plan = buildRecommendedQuestPlan(preferredLength);
  return createQuestFromPlan(studentProfileId, plan, "daily");
}

export async function createSubjectDailyQuest(studentProfileId: string, subjectId: string, preferredLength = 8) {
  const subject = getSubject(subjectId);
  const plan = buildSubjectQuestPlan(subject.id, preferredLength);
  return createQuestFromPlan(studentProfileId, plan, "daily");
}

async function createQuestFromPlan(studentProfileId: string, plan: ReturnType<typeof buildSubjectQuestPlan>, questType: Quest["questType"]) {
  const child = requireChild(studentProfileId);
  const focusSkillId = plan[0]?.skillId ?? DEFAULT_FOCUS_SKILL_ID;
  const focusSkill = skills.find((skill) => skill.id === focusSkillId) ?? skills[0];
  const presentation = await personalizeQuest({ child, focusSkill, questLength: plan.length });
  const quest: Quest = {
    id: id("quest"),
    childProfileId: studentProfileId,
    questType,
    title: presentation.title,
    flavorText: presentation.flavor,
    presentation,
    focusSkillId,
    status: "in_progress",
    startedAt: now(),
    totalProblems: plan.length,
    correctProblems: 0,
    xpEarned: 0,
    coinsEarned: 0
  };
  store.quests.set(quest.id, quest);
  plan.forEach((item, index) => {
    const generated = generateActivity(item.activityType, { difficulty: item.difficulty, seed: index });
    const attempt: ActivityAttempt = {
      ...generated,
      id: id("attempt"),
      questId: quest.id,
      childProfileId: studentProfileId,
      problemType: item.activityType,
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

export const getNextActivity = getNextProblem;

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
  const isCorrect = checkActivityAnswer(attempt, submittedAnswer);
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

export const submitActivityAnswer = submitAnswer;

export function requestHint(attemptId: string, hintLevel: number) {
  const attempt = requireAttempt(attemptId);
  const level = Math.min(3, Math.max(1, hintLevel));
  attempt.hintsUsed = Math.max(attempt.hintsUsed, level);
  return { hint: { level, message: attempt.hintSequence[level - 1] } };
}

export const requestActivityHint = requestHint;

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
    totalActivities: totalProblems,
    accuracy: totalProblems ? Number((correct / totalProblems).toFixed(2)) : 0,
    minutesPracticed: quests.length * 10,
    subjects: subjects.filter((subject) => subject.status === "active").map((subject) => {
      const subjectAttempts = attempts.filter((attempt) => attempt.subjectId === subject.id);
      const subjectCorrect = subjectAttempts.filter((attempt) => attempt.isCorrect).length;
      return {
        subjectKey: subject.slug,
        name: subject.name,
        activitiesCompleted: subjectAttempts.length,
        accuracy: subjectAttempts.length ? Number((subjectCorrect / subjectAttempts.length).toFixed(2)) : 0,
        needsPractice: skillStats.filter((item) => item.skill.subjectId === subject.id && item.accuracy < 0.75).map((item) => item.skill.name).slice(0, 2)
      };
    }),
    strongSkills,
    needsPractice: needsPractice.length ? needsPractice : ["Adding Fractions with Unlike Denominators"],
    summary: totalProblems
      ? `Practice is moving. ${correct} of ${totalProblems} problems are correct, with the next best focus on ${needsPractice[0] ?? "fraction fluency"}.`
      : "No completed quest yet. The first daily quest will give a clearer read on strengths and practice needs.",
    recommendedNextQuest: {
      title: "Common Denominator Repair Run",
      subjectKey: "math",
      focusSkillKey: "add-fractions-unlike-denominators",
      focusSkillId: "skill_add_fractions_unlike_denominators"
    }
  };
}

function updateProgress(attempt: ActivityAttempt, xp: number) {
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

function feedbackFor(attempt: ActivityAttempt, submittedAnswer: string, isCorrect: boolean) {
  if (isCorrect) return `Nice. ${attempt.explanation}`;
  return `Close, but the forge is not hot yet. ${attempt.hintSequence[0]}`;
}

function publicProblem(attempt: ActivityAttempt, index: number, total: number) {
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

function buildSubjectQuestPlan(subjectId: string, preferredLength: number) {
  if (preferredLength !== 8) {
    throw new Error("Daily quest must contain exactly 8 activities.");
  }
  if (subjectId === SUBJECT_IDS.math) {
    const mathPlan = buildDailyQuestPlan();
    if (!validateDailyQuestPlan(mathPlan)) {
      throw new Error("Daily quest must contain exactly 5 focus, 2 review, and 1 challenge problems.");
    }
    return mathPlan.map((item) => ({
      activityType: item.problemType,
      difficulty: item.difficulty,
      role: item.role,
      skillId: activityTemplates.find((template) => template.activityType === item.problemType)?.skillId ?? DEFAULT_FOCUS_SKILL_ID
    }));
  }
  const templates = activityTemplates.filter((template) => template.subjectId === subjectId && template.status === "active");
  if (!templates.length) throw new Error("Subject does not have active daily quest activities.");
  return Array.from({ length: preferredLength }, (_, index) => {
    const template = templates[index % templates.length];
    return {
      activityType: template.activityType,
      difficulty: index === preferredLength - 1 ? 2 : 1,
      role: index < 5 ? "focus" : index < 7 ? "review" : "challenge",
      skillId: template.skillId
    };
  });
}

function buildRecommendedQuestPlan(preferredLength: number) {
  if (preferredLength !== 8) {
    throw new Error("Daily quest must contain exactly 8 activities.");
  }
  const mathPlan = buildSubjectQuestPlan(SUBJECT_IDS.math, 8).slice(0, 3);
  const readingTemplates = activityTemplates.filter((template) => template.subjectId === SUBJECT_IDS.reading && template.status === "active");
  const vocabularyTemplates = activityTemplates.filter((template) => template.subjectId === SUBJECT_IDS.vocabulary && template.status === "active");
  const mixedTemplates = [...readingTemplates.slice(0, 3), ...vocabularyTemplates.slice(0, 2)];
  return [
    ...mathPlan,
    ...mixedTemplates.map((template, index) => ({
      activityType: template.activityType,
      difficulty: index === mixedTemplates.length - 1 ? 2 : 1,
      role: index < 3 ? "focus" : "review",
      skillId: template.skillId
    }))
  ];
}

function checkActivityAnswer(attempt: ActivityAttempt, submittedAnswer: string) {
  if (attempt.subjectId === SUBJECT_IDS.math && attempt.problemType) {
    return checkAnswer(attempt as ProblemAttempt, submittedAnswer);
  }
  return validateActivityAnswer(attempt, submittedAnswer).isCorrect;
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
