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
  validateActivityAnswer,
  validateDailyQuestPlan,
  type ActivityType,
  type AvatarKey,
  type ChildProfile,
  type ChildSkillProgress,
  type GeneratedActivity,
  type ProblemAttempt,
  type Quest,
  type Theme,
  type TutorTone
} from "@learningforge/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "./db/client.js";
import { personalizeQuest } from "./ai/questPersonalization.js";

const now = () => new Date();
const nowIso = () => now().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

type QuestPlanItem = {
  activityType: ActivityType;
  difficulty: number;
  role: string;
  skillId: string;
};

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

export async function createChildProfile(input: {
  displayName: string;
  gradeLevel: number;
  interests?: string[];
  avatarKey?: AvatarKey;
  preferredTheme: Theme;
  tutorTone: TutorTone;
  dailyGoalMinutes: number;
}) {
  await ensureSeeded();
  const timestamp = now();
  const childProfile = await prisma.studentProfile.create({
    data: {
      id: id("child"),
      displayName: input.displayName,
      gradeLevel: input.gradeLevel,
      interests: input.interests ?? [],
      avatarKey: input.avatarKey ?? "ember_smith",
      preferredTheme: input.preferredTheme,
      tutorTone: input.tutorTone,
      dailyGoalMinutes: input.dailyGoalMinutes,
      createdAt: timestamp,
      updatedAt: timestamp,
      inventory: {
        create: {
          id: id("inventory"),
          coins: 0,
          xp: 0,
          level: 1
        }
      },
      progress: {
        create: skills.map((skill) => ({
          id: id("progress"),
          skillId: skill.id,
          level: 1,
          xp: 0,
          masteryScore: 0,
          attempts: 0,
          correct: 0,
          streakCorrect: 0,
          streakIncorrect: 0,
          currentDifficulty: 1
        }))
      }
    }
  });
  return toChildProfile(childProfile);
}

export const createStudentProfile = createChildProfile;

export async function getSubjects() {
  await ensureSeeded();
  return subjects;
}

export async function getSubject(subjectId: string) {
  await ensureSeeded();
  const subject = subjects.find((item) => item.id === subjectId || item.slug === subjectId);
  if (!subject) throw new Error("Subject not found.");
  return subject;
}

export async function getHome(childProfileId: string) {
  await ensureSeeded();
  const child = await requireChild(childProfileId);
  const inventory = await requireInventory(childProfileId);
  const level = levelFromXp(inventory.xp);
  const existingDaily = await prisma.quest.findFirst({
    where: { studentProfileId: childProfileId, questType: "daily", status: { not: "completed" } },
    orderBy: { startedAt: "desc" }
  });
  const progress = await prisma.studentSkillProgress.findMany({ where: { studentProfileId: childProfileId } });
  const activeSubjectSummaries = subjects.filter((subject) => subject.status === "active").map((subject) => {
    const subjectSkills = skills.filter((skill) => skill.subjectId === subject.id);
    const progressItems = subjectSkills.map((skill) => progress.find((item) => item.skillId === skill.id)).filter(Boolean);
    const mastery = progressItems.length ? progressItems.reduce((sum, item) => sum + item!.masteryScore, 0) / progressItems.length : 0;
    const xp = progressItems.reduce((sum, item) => sum + item!.xp, 0);
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
      const skillProgress = progress.find((item) => item.skillId === skill.id);
      return { skillId: skill.id, name: skill.name, level: skillProgress?.level ?? 1, masteryScore: skillProgress?.masteryScore ?? 0 };
    }),
    forge: { upgrades: await forgeForChild(childProfileId) },
    domains: skillDomains
  };
}

export const getStudentHome = getHome;

export async function createDailyQuest(childProfileId: string, preferredLength = 8) {
  return createRecommendedDailyQuest(childProfileId, preferredLength, "auto");
}

export async function createRecommendedDailyQuest(studentProfileId: string, preferredLength = 8, subjectPreference = "auto") {
  if (subjectPreference !== "auto") return createSubjectDailyQuest(studentProfileId, subjectPreference, preferredLength);
  return createQuestFromPlan(studentProfileId, buildRecommendedQuestPlan(preferredLength), "daily");
}

export async function createSubjectDailyQuest(studentProfileId: string, subjectId: string, preferredLength = 8) {
  const subject = await getSubject(subjectId);
  return createQuestFromPlan(studentProfileId, buildSubjectQuestPlan(subject.id, preferredLength), "daily");
}

export async function getNextProblem(questId: string) {
  await requireQuest(questId);
  const attempts = await attemptsForQuest(questId);
  const next = attempts.find((attempt) => attempt.isCorrect !== true);
  if (!next) return null;
  return publicProblem(next, attempts.indexOf(next), attempts.length);
}

export const getNextActivity = getNextProblem;

export async function submitAnswer(attemptId: string, submittedAnswer: string, timeSpentSeconds?: number) {
  const result = await prisma.$transaction(async (tx) => {
    const lockedAttempt = await lockAttemptForUpdate(tx, attemptId);
    const quest = await tx.quest.findUnique({ where: { id: lockedAttempt.questId } });
    if (!quest) throw new Error("Quest not found.");
    if (lockedAttempt.isCorrect === true) {
      return {
        isCorrect: true,
        correctAnswer: lockedAttempt.correctAnswer,
        feedback: { message: feedbackFor(lockedAttempt, lockedAttempt.submittedAnswer ?? submittedAnswer, true), tone: "positive" as const },
        rewardPreview: { xp: 0, coins: 0 },
        hintAvailable: false,
        nextAction: "continue" as const
      };
    }

    const wasWrongBefore = lockedAttempt.isCorrect === false;
    const isCorrect = checkActivityAnswer(lockedAttempt, submittedAnswer);
    const reward = answerReward({ isCorrect, hintsUsed: lockedAttempt.hintsUsed, wasIncorrectThenCorrected: wasWrongBefore && isCorrect });
    const answeredAt = now();

    await tx.activityAttempt.update({
      where: { id: attemptId },
      data: {
        submittedAnswer,
        isCorrect,
        score: isCorrect ? 1 : 0,
        maxScore: 1,
        timeSpentSeconds,
        answeredAt
      }
    });
    if (!isCorrect) {
      return {
        isCorrect: false,
        correctAnswer: lockedAttempt.correctAnswer,
        feedback: { message: feedbackFor(lockedAttempt, submittedAnswer, false), tone: "scaffold" as const },
        rewardPreview: reward,
        hintAvailable: true,
        nextAction: "retry" as const
      };
    }

    await tx.quest.update({
      where: { id: quest.id },
      data: {
        xpEarned: { increment: reward.xp },
        coinsEarned: { increment: reward.coins },
        correctProblems: { increment: 1 },
        correctActivities: { increment: 1 },
        completedActivities: { increment: 1 }
      }
    });
    const progress = await tx.studentSkillProgress.findUnique({
      where: { studentProfileId_skillId: { studentProfileId: lockedAttempt.childProfileId, skillId: lockedAttempt.skillId } }
    });
    if (progress) {
      const nextAttempts = progress.attempts + 1;
      const nextCorrect = progress.correct + 1;
      const nextXp = progress.xp + reward.xp;
      await tx.studentSkillProgress.update({
        where: { studentProfileId_skillId: { studentProfileId: lockedAttempt.childProfileId, skillId: lockedAttempt.skillId } },
        data: {
          attempts: nextAttempts,
          correct: nextCorrect,
          xp: nextXp,
          level: levelFromXp(nextXp).level,
          streakCorrect: { increment: 1 },
          streakIncorrect: 0,
          masteryScore: masteryScore({ attempts: nextAttempts, correct: nextCorrect }),
          lastPracticedAt: answeredAt
        }
      });
    }

    return {
      isCorrect: true,
      correctAnswer: lockedAttempt.correctAnswer,
      feedback: { message: feedbackFor(lockedAttempt, submittedAnswer, true), tone: "positive" as const },
      rewardPreview: reward,
      hintAvailable: false,
      nextAction: "continue" as const
    };
  });

  return result;
}

export const submitActivityAnswer = submitAnswer;

export async function requestHint(attemptId: string, hintLevel: number) {
  const attempt = await requireAttempt(attemptId);
  const level = Math.min(3, Math.max(1, hintLevel));
  await prisma.activityAttempt.update({ where: { id: attemptId }, data: { hintsUsed: Math.max(attempt.hintsUsed, level) } });
  return { hint: { level, message: attempt.hintSequence[level - 1] } };
}

export const requestActivityHint = requestHint;

export async function completeQuest(questId: string) {
  const completedQuest = await prisma.$transaction(async (tx) => {
    const quest = await lockQuestForUpdate(tx, questId);
    const attempts = await tx.activityAttempt.findMany({ where: { questId }, orderBy: { createdAt: "asc" } });
    if (attempts.some((attempt) => attempt.isCorrect !== true)) {
      throw new Error("Quest cannot be completed until every problem is answered correctly.");
    }

    if (quest.status !== "completed") {
      const completionXp = rewardRules.questCompletionXp;
      const completionCoins = rewardRules.questCompletionCoins + (quest.correctProblems === quest.totalProblems ? rewardRules.perfectQuestBonusCoins : 0);
      const updated = await tx.quest.update({
        where: { id: questId },
        data: {
          status: "completed",
          completedAt: now(),
          xpEarned: { increment: completionXp },
          coinsEarned: { increment: completionCoins },
          completedActivities: attempts.length,
          correctActivities: quest.correctProblems
        }
      });
      const inventory = await tx.rewardInventory.findUniqueOrThrow({ where: { studentProfileId: quest.childProfileId } });
      const nextXp = inventory.xp + updated.xpEarned;
      await tx.rewardInventory.update({
        where: { studentProfileId: quest.childProfileId },
        data: {
          xp: nextXp,
          coins: { increment: updated.coinsEarned },
          level: levelFromXp(nextXp).level,
          lastCompletedAt: updated.completedAt
        }
      });
      return toQuest(updated);
    }
    return quest;
  });

  const bySkill = new Map<string, { attempts: number; correct: number }>();
  const attempts = await attemptsForQuest(questId);
  for (const attempt of attempts) {
    const current = bySkill.get(attempt.skillId) ?? { attempts: 0, correct: 0 };
    current.attempts += 1;
    current.correct += attempt.isCorrect ? 1 : 0;
    bySkill.set(attempt.skillId, current);
  }
  return {
    questSummary: {
      questId: completedQuest.id,
      totalProblems: completedQuest.totalProblems,
      totalActivities: completedQuest.totalProblems,
      correctProblems: completedQuest.correctProblems,
      correctActivities: completedQuest.correctProblems,
      xpEarned: completedQuest.xpEarned,
      coinsEarned: completedQuest.coinsEarned,
      skillsPracticed: [...bySkill].map(([skillId, stats]) => ({
        skillId,
        name: skills.find((skill) => skill.id === skillId)?.name ?? skillId,
        attempts: stats.attempts,
        correct: stats.correct,
        masteryDelta: Number((stats.correct / stats.attempts * 0.1).toFixed(2))
      }))
    },
    rewards: { levelUp: false, coins: completedQuest.coinsEarned, unlockedItems: [] },
    message: "Quest complete. The Learning Forge is brighter now."
  };
}

export async function buyForgeUpgrade(childProfileId: string, upgradeKey: string) {
  const config = forgeUpgrades.find((upgrade) => upgrade.key === upgradeKey);
  if (!config) throw new Error("Unknown forge upgrade.");
  const result = await prisma.$transaction(async (tx) => {
    const inventory = await tx.rewardInventory.findUniqueOrThrow({ where: { studentProfileId: childProfileId } });
    const existing = await tx.forgeUpgrade.findUnique({ where: { studentProfileId_upgradeKey: { studentProfileId: childProfileId, upgradeKey } } });
    const nextLevel = (existing?.level ?? 0) + 1;
    if (nextLevel > config.maxLevel) throw new Error("Upgrade is already max level.");
    if (inventory.coins < config.cost) throw new Error("Not enough coins.");
    const updatedInventory = await tx.rewardInventory.update({
      where: { studentProfileId: childProfileId },
      data: { coins: { decrement: config.cost } }
    });
    if (existing) {
      await tx.forgeUpgrade.update({ where: { id: existing.id }, data: { level: nextLevel } });
    } else {
      await tx.forgeUpgrade.create({
        data: { id: id("upgrade"), studentProfileId: childProfileId, upgradeKey, upgradeName: config.name, level: 1, purchasedAt: now() }
      });
    }
    return { inventory: updatedInventory, upgrades: await tx.forgeUpgrade.findMany({ where: { studentProfileId: childProfileId } }) };
  });
  return {
    inventory: toRewardInventory(result.inventory),
    upgrades: result.upgrades.map(toForgeUpgrade)
  };
}

export async function parentSummary(childProfileId: string) {
  await requireChild(childProfileId);
  const quests = await prisma.quest.findMany({ where: { studentProfileId: childProfileId, status: "completed" } });
  const attempts = await prisma.activityAttempt.findMany({ where: { studentProfileId: childProfileId, answeredAt: { not: null } } });
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
      ? `Practice is moving. ${correct} of ${totalProblems} activities are correct, with the next best focus on ${needsPractice[0] ?? "fraction fluency"}.`
      : "No completed quest yet. The first daily quest will give a clearer read on strengths and practice needs.",
    recommendedNextQuest: {
      title: "Common Denominator Repair Run",
      subjectKey: "math",
      focusSkillKey: "add-fractions-unlike-denominators",
      focusSkillId: "skill_add_fractions_unlike_denominators"
    }
  };
}

async function createQuestFromPlan(studentProfileId: string, plan: QuestPlanItem[], questType: Quest["questType"]) {
  await ensureSeeded();
  const child = await requireChild(studentProfileId);
  const focusSkillId = plan[0]?.skillId ?? DEFAULT_FOCUS_SKILL_ID;
  const focusSkill = skills.find((skill) => skill.id === focusSkillId) ?? skills[0];
  const presentation = await personalizeQuest({ child, focusSkill, questLength: plan.length });
  const primarySubjectId = activityTemplates.find((template) => template.activityType === plan[0]?.activityType)?.subjectId ?? SUBJECT_IDS.math;
  const startedAt = now();
  const quest = await prisma.$transaction(async (tx) => {
    const createdQuest = await tx.quest.create({
      data: {
        id: id("quest"),
        studentProfileId,
        primarySubjectId,
        questType,
        title: presentation.title,
        flavorText: presentation.flavor,
        presentation: presentation as unknown as object,
        focusSkillId,
        status: "in_progress",
        startedAt,
        totalActivities: plan.length,
        totalProblems: plan.length,
        correctProblems: 0,
        correctActivities: 0,
        completedActivities: 0,
        xpEarned: 0,
        coinsEarned: 0
      }
    });
    await tx.activityAttempt.createMany({
      data: plan.map((item, index) => {
        const generated = generateActivity(item.activityType, { difficulty: item.difficulty, seed: index });
        const template = activityTemplates.find((candidate) => candidate.activityType === item.activityType);
        return {
          id: id("attempt"),
          questId: createdQuest.id,
          studentProfileId,
          subjectId: generated.subjectId,
          domainId: generated.domainId,
          skillId: generated.skillId,
          activityTemplateId: template?.id,
          activityType: generated.activityType,
          prompt: generated.prompt,
          stimulus: generated.stimulus as unknown as object | undefined,
          answerFormat: generated.answerFormat,
          choices: generated.choices as unknown as object | undefined,
          correctAnswer: generated.correctAnswer,
          validationMode: generated.validationMode ?? "deterministic",
          rubric: generated.rubric as unknown as object | undefined,
          difficulty: generated.difficulty,
          hintsUsed: 0,
          explanation: generated.explanation,
          hintSequence: generated.hintSequence,
          metadata: { ...generated.metadata, questRole: item.role, order: index + 1 }
        };
      }) as never
    });
    return createdQuest;
  });
  return toQuest(quest);
}

function buildSubjectQuestPlan(subjectId: string, preferredLength: number): QuestPlanItem[] {
  if (preferredLength !== 8) throw new Error("Daily quest must contain exactly 8 activities.");
  if (subjectId === SUBJECT_IDS.math) {
    const mathPlan = buildDailyQuestPlan();
    if (!validateDailyQuestPlan(mathPlan)) throw new Error("Daily quest must contain exactly 5 focus, 2 review, and 1 challenge problems.");
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

function buildRecommendedQuestPlan(preferredLength: number): QuestPlanItem[] {
  if (preferredLength !== 8) throw new Error("Daily quest must contain exactly 8 activities.");
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

function feedbackFor(attempt: ActivityAttempt, _submittedAnswer: string, isCorrect: boolean) {
  if (isCorrect) return `Nice. ${attempt.explanation}`;
  return `Close, but the forge is not hot yet. ${attempt.hintSequence[0]}`;
}

function publicProblem(attempt: ActivityAttempt, index: number, total: number) {
  const { correctAnswer, explanation, hintSequence, ...safeProblem } = attempt;
  return { ...safeProblem, progress: { current: index + 1, total }, skillName: skills.find((skill) => skill.id === attempt.skillId)?.name ?? "Learning" };
}

async function attemptsForQuest(questId: string) {
  const rows = await prisma.activityAttempt.findMany({ where: { questId }, orderBy: { createdAt: "asc" } });
  return rows.map(toAttempt).sort((a, b) => Number(a.metadata.order) - Number(b.metadata.order));
}

async function forgeForChild(childProfileId: string) {
  return (await prisma.forgeUpgrade.findMany({ where: { studentProfileId: childProfileId } })).map(toForgeUpgrade);
}

async function requireChild(childProfileId: string): Promise<ChildProfile> {
  const child = await prisma.studentProfile.findUnique({ where: { id: childProfileId } });
  if (!child) throw new Error("Child profile not found.");
  return toChildProfile(child);
}

async function requireInventory(childProfileId: string) {
  const inventory = await prisma.rewardInventory.findUnique({ where: { studentProfileId: childProfileId } });
  if (!inventory) throw new Error("Reward inventory not found.");
  return toRewardInventory(inventory);
}

async function requireQuest(questId: string): Promise<Quest> {
  const quest = await prisma.quest.findUnique({ where: { id: questId } });
  if (!quest) throw new Error("Quest not found.");
  return toQuest(quest);
}

async function requireAttempt(attemptId: string): Promise<ActivityAttempt> {
  const attempt = await prisma.activityAttempt.findUnique({ where: { id: attemptId } });
  if (!attempt) throw new Error("Problem attempt not found.");
  return toAttempt(attempt);
}

async function lockAttemptForUpdate(tx: Prisma.TransactionClient, attemptId: string): Promise<ActivityAttempt> {
  const rows = await tx.$queryRaw<any[]>`SELECT * FROM "ActivityAttempt" WHERE "id" = ${attemptId} FOR UPDATE`;
  const attempt = rows[0];
  if (!attempt) throw new Error("Problem attempt not found.");
  return toAttempt(attempt);
}

async function lockQuestForUpdate(tx: Prisma.TransactionClient, questId: string): Promise<Quest> {
  const rows = await tx.$queryRaw<any[]>`SELECT * FROM "Quest" WHERE "id" = ${questId} FOR UPDATE`;
  const quest = rows[0];
  if (!quest) throw new Error("Quest not found.");
  return toQuest(quest);
}

async function ensureSeeded() {
  const count = await prisma.subject.count();
  if (count === 0) throw new Error("LearningForge seed data is missing. Run npm run db:seed before starting the API.");
}

function toChildProfile(row: any): ChildProfile {
  return {
    id: row.id,
    parentUserId: row.parentUserId ?? undefined,
    displayName: row.displayName,
    gradeLevel: row.gradeLevel,
    age: row.age ?? undefined,
    interests: row.interests ?? [],
    avatarKey: row.avatarKey,
    preferredTheme: row.preferredTheme,
    tutorTone: row.tutorTone,
    dailyGoalMinutes: row.dailyGoalMinutes,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt
  };
}

function toRewardInventory(row: any) {
  return {
    id: row.id,
    childProfileId: row.studentProfileId,
    coins: row.coins,
    xp: row.xp,
    level: row.level,
    unlockedItems: row.unlockedItems ?? [],
    equippedItems: row.equippedItems ?? []
  };
}

function toQuest(row: any): Quest {
  return {
    id: row.id,
    childProfileId: row.studentProfileId,
    questType: row.questType,
    title: row.title,
    flavorText: row.flavorText ?? undefined,
    presentation: row.presentation ?? undefined,
    focusSkillId: row.focusSkillId ?? DEFAULT_FOCUS_SKILL_ID,
    status: row.status,
    startedAt: row.startedAt ? row.startedAt.toISOString() : undefined,
    completedAt: row.completedAt ? row.completedAt.toISOString() : undefined,
    totalProblems: row.totalProblems,
    correctProblems: row.correctProblems,
    xpEarned: row.xpEarned,
    coinsEarned: row.coinsEarned
  };
}

function toAttempt(row: any): ActivityAttempt {
  return {
    id: row.id,
    questId: row.questId,
    childProfileId: row.studentProfileId,
    subjectId: row.subjectId,
    domainId: row.domainId,
    skillId: row.skillId,
    activityType: row.activityType,
    problemType: row.activityType,
    prompt: row.prompt,
    stimulus: row.stimulus ?? undefined,
    answerFormat: row.answerFormat,
    choices: row.choices ?? undefined,
    correctAnswer: String(row.correctAnswer ?? ""),
    validationMode: row.validationMode,
    rubric: row.rubric ?? undefined,
    explanation: row.explanation,
    hintSequence: row.hintSequence,
    difficulty: row.difficulty,
    metadata: row.metadata ?? {},
    submittedAnswer: typeof row.submittedAnswer === "string" ? row.submittedAnswer : row.submittedAnswer ? String(row.submittedAnswer) : undefined,
    isCorrect: row.isCorrect ?? undefined,
    hintsUsed: row.hintsUsed,
    timeSpentSeconds: row.timeSpentSeconds ?? undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt,
    answeredAt: row.answeredAt ? row.answeredAt.toISOString() : undefined
  };
}

function toForgeUpgrade(row: any) {
  return {
    id: row.id,
    childProfileId: row.studentProfileId,
    upgradeKey: row.upgradeKey,
    upgradeName: row.upgradeName,
    level: row.level,
    purchasedAt: row.purchasedAt instanceof Date ? row.purchasedAt.toISOString() : row.purchasedAt
  };
}
