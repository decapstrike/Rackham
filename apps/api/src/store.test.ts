import { rewardRules } from "@learningforge/shared";
import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app } from "./app.js";
import {
  buyForgeUpgrade,
  completeQuest,
  createChildProfile,
  createDailyQuest,
  getNextProblem,
  parentSummary,
  requestHint,
  store,
  submitAnswer
} from "./store.js";

describe("LearningForge store quest lifecycle", () => {
  beforeEach(() => {
    store.children.clear();
    store.rewards.clear();
    store.progress.clear();
    store.quests.clear();
    store.attempts.clear();
    store.forge.clear();
  });

  it("runs the daily quest loop with personalized presentation", async () => {
    const child = createTestChild({ interests: ["soccer"], avatarKey: "gear_knight" });

    const quest = await createDailyQuest(child.id, 8);
    expect(quest.presentation?.title).toContain("Playbook");
    expect(quest.presentation?.environment).toBe("arena_keep");
    expect(() => completeQuest(quest.id)).toThrow("Quest cannot be completed");

    for (let i = 0; i < 8; i += 1) {
      const next = getNextProblem(quest.id);
      expect((next as Record<string, unknown>)?.correctAnswer).toBeUndefined();
      expect((next as Record<string, unknown>)?.explanation).toBeUndefined();
      expect((next as Record<string, unknown>)?.hintSequence).toBeUndefined();
      const attemptId = next!.id;
      expect(requestHint(attemptId, 1).hint.message).toBeTruthy();
      const correct = store.attempts.get(attemptId)?.correctAnswer;
      const result = submitAnswer(attemptId, correct ?? "999", 12);
      expect(result.isCorrect).toBe(true);
    }

    const complete = completeQuest(quest.id);
    expect(complete.questSummary.totalProblems).toBe(8);
    expect(complete.questSummary.xpEarned).toBeGreaterThan(0);

    const summary = parentSummary(child.id);
    expect(summary.totalProblems).toBe(8);
  });

  it("creates the MVP mixed-subject daily quest composition", async () => {
    const child = createTestChild();

    await expect(createDailyQuest(child.id, 7)).rejects.toThrow("Daily quest must contain exactly");
    const quest = await createDailyQuest(child.id, 8);
    const attempts = attemptsForQuest(quest.id);

    expect(attempts).toHaveLength(8);
    expect(attempts.map((attempt) => attempt.metadata.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(new Set(attempts.map((attempt) => attempt.subjectId))).toEqual(new Set(["subject_math", "subject_reading", "subject_vocabulary"]));
    expect(attempts.filter((attempt) => attempt.metadata.questRole === "focus")).toHaveLength(6);
    expect(attempts.filter((attempt) => attempt.metadata.questRole === "review")).toHaveLength(2);
    expect(getNextProblem(quest.id)?.progress).toEqual({ current: 1, total: 8 });
  });

  it("rewards correction once and does not double count a repeated answer submission", async () => {
    const child = createTestChild();
    const quest = await createDailyQuest(child.id, 8);
    const first = getNextProblem(quest.id)!;

    const miss = submitAnswer(first.id, "not the answer", 9);
    expect(miss.isCorrect).toBe(false);
    expect(miss.rewardPreview).toEqual({ xp: 0, coins: 0 });
    expect(getNextProblem(quest.id)?.id).toBe(first.id);

    requestHint(first.id, 2);
    const correctAnswer = store.attempts.get(first.id)!.correctAnswer;
    const recovered = submitAnswer(first.id, correctAnswer, 11);
    expect(recovered.isCorrect).toBe(true);
    expect(recovered.rewardPreview).toEqual({
      xp: rewardRules.recoveryXp,
      coins: rewardRules.recoveryCoins
    });

    const questAfterRecovery = store.quests.get(quest.id)!;
    expect(questAfterRecovery.correctProblems).toBe(1);
    expect(questAfterRecovery.xpEarned).toBe(rewardRules.recoveryXp);
    expect(questAfterRecovery.coinsEarned).toBe(rewardRules.recoveryCoins);

    const duplicate = submitAnswer(first.id, correctAnswer, 1);
    expect(duplicate.isCorrect).toBe(true);
    expect(duplicate.rewardPreview).toEqual({ xp: 0, coins: 0 });
    expect(store.quests.get(quest.id)!.correctProblems).toBe(1);
    expect(store.quests.get(quest.id)!.xpEarned).toBe(rewardRules.recoveryXp);
    expect(store.quests.get(quest.id)!.coinsEarned).toBe(rewardRules.recoveryCoins);
  });

  it("completes a perfect quest idempotently", async () => {
    const child = createTestChild();
    const quest = await createDailyQuest(child.id, 8);

    answerRemainingProblems(quest.id);
    const firstComplete = completeQuest(quest.id);
    const inventoryAfterFirst = { ...store.rewards.get(child.id)! };
    const questAfterFirst = { ...store.quests.get(quest.id)! };

    expect(firstComplete.questSummary.correctProblems).toBe(8);
    expect(firstComplete.questSummary.xpEarned).toBe(8 * rewardRules.correctXp + rewardRules.questCompletionXp);
    expect(firstComplete.questSummary.coinsEarned).toBe(8 * rewardRules.correctCoins + rewardRules.questCompletionCoins + rewardRules.perfectQuestBonusCoins);
    expect(inventoryAfterFirst.xp).toBe(firstComplete.questSummary.xpEarned);
    expect(inventoryAfterFirst.coins).toBe(firstComplete.questSummary.coinsEarned);

    const secondComplete = completeQuest(quest.id);
    expect(secondComplete.questSummary).toEqual(firstComplete.questSummary);
    expect(store.rewards.get(child.id)).toMatchObject({
      xp: inventoryAfterFirst.xp,
      coins: inventoryAfterFirst.coins,
      level: inventoryAfterFirst.level
    });
    expect(store.quests.get(quest.id)).toMatchObject({
      status: "completed",
      completedAt: questAfterFirst.completedAt,
      xpEarned: questAfterFirst.xpEarned,
      coinsEarned: questAfterFirst.coinsEarned
    });
  });

  it("buys forge upgrades with coin deduction and level caps", () => {
    const child = createTestChild();
    const inventory = store.rewards.get(child.id)!;

    expect(() => buyForgeUpgrade(child.id, "unknown")).toThrow("Unknown forge upgrade");
    expect(() => buyForgeUpgrade(child.id, "anvil")).toThrow("Not enough coins");

    inventory.coins = 200;
    const firstPurchase = buyForgeUpgrade(child.id, "anvil");
    expect(firstPurchase.inventory.coins).toBe(150);
    expect(firstPurchase.upgrades).toMatchObject([{ upgradeKey: "anvil", upgradeName: "Apprentice Anvil", level: 1 }]);

    buyForgeUpgrade(child.id, "anvil");
    const thirdPurchase = buyForgeUpgrade(child.id, "anvil");
    expect(thirdPurchase.inventory.coins).toBe(50);
    expect(thirdPurchase.upgrades.find((upgrade) => upgrade.upgradeKey === "anvil")?.level).toBe(3);
    expect(() => buyForgeUpgrade(child.id, "anvil")).toThrow("Upgrade is already max level");
  });

  it("builds a parent summary from completed quest attempts", async () => {
    const child = createTestChild({ interests: ["space"], preferredTheme: "forge" });
    const emptySummary = parentSummary(child.id);
    expect(emptySummary.sessionsCompleted).toBe(0);
    expect(emptySummary.summary).toContain("No completed quest yet");

    const quest = await createDailyQuest(child.id, 8);
    const first = getNextProblem(quest.id)!;
    submitAnswer(first.id, "not the answer", 14);
    submitAnswer(first.id, store.attempts.get(first.id)!.correctAnswer, 10);
    answerRemainingProblems(quest.id);
    completeQuest(quest.id);

    const summary = parentSummary(child.id);
    expect(summary).toMatchObject({
      period: "7d",
      sessionsCompleted: 1,
      totalProblems: 8,
      accuracy: 1,
      minutesPracticed: 10
    });
    expect(summary.strongSkills).toContain("Equivalent Fractions");
    expect(summary.needsPractice).toContain("Adding Fractions with Unlike Denominators");
    expect(summary.summary).toContain("8 of 8 problems are correct");
    expect(summary.recommendedNextQuest.focusSkillId).toBe("skill_add_fractions_unlike_denominators");
  });
});

describe("LearningForge subject-agnostic API aliases", () => {
  beforeEach(() => {
    store.children.clear();
    store.rewards.clear();
    store.progress.clear();
    store.quests.clear();
    store.attempts.clear();
    store.forge.clear();
  });

  it("creates student profiles alongside child profile compatibility", async () => {
    const response = await request(app)
      .post("/student-profiles")
      .send({
        displayName: "Reader",
        gradeLevel: 5,
        interests: ["mystery"],
        preferredTheme: "fantasy",
        tutorTone: "guide",
        dailyGoalMinutes: 10
      })
      .expect(201);

    expect(response.body.studentProfile.id).toBeTruthy();
    expect(response.body.childProfile).toEqual(response.body.studentProfile);

    const home = await request(app)
      .get(`/student-profiles/${response.body.studentProfile.id}/home`)
      .expect(200);

    expect(home.body.child.displayName).toBe("Reader");
    expect(home.body.dailyQuest.title).toBe("Daily LearningForge Quest");
  });

  it("lists subjects and runs math, reading, and vocabulary daily quests through activity aliases", async () => {
    const profile = await request(app)
      .post("/student-profiles")
      .send({ displayName: "Player" })
      .expect(201);
    const studentProfileId = profile.body.studentProfile.id;

    const subjects = await request(app).get("/subjects").expect(200);
    expect(subjects.body.subjects.filter((subject: { status: string }) => subject.status === "active").map((subject: { slug: string }) => subject.slug)).toEqual(["math", "reading", "vocabulary"]);

    for (const subjectSlug of ["math", "reading", "vocabulary"]) {
      await request(app).get(`/subjects/${subjectSlug}`).expect(200);

      const quest = await request(app)
        .post(`/student-profiles/${studentProfileId}/subjects/${subjectSlug}/quests/daily`)
        .send({ preferredLength: 8 })
        .expect(201);

      const nextActivity = await request(app)
        .get(`/quests/${quest.body.quest.id}/next-activity`)
        .expect(200);

      expect(nextActivity.body.activity.id).toBeTruthy();
      expect(nextActivity.body.problem).toEqual(nextActivity.body.activity);
      expect(nextActivity.body.activity.correctAnswer).toBeUndefined();
      expect(nextActivity.body.activity.subjectId).toBe(`subject_${subjectSlug}`);

      const attemptId = nextActivity.body.activity.id;
      const correctAnswer = store.activityAttempts.get(attemptId)?.correctAnswer;

      const hint = await request(app)
        .post(`/activity-attempts/${attemptId}/hint`)
        .send({ hintLevel: 1 })
        .expect(200);
      expect(hint.body.hint.message).toBeTruthy();

      const answer = await request(app)
        .post(`/activity-attempts/${attemptId}/answer`)
        .send({ submittedAnswer: correctAnswer, timeSpentSeconds: 15 })
        .expect(200);
      expect(answer.body.isCorrect).toBe(true);
    }
  });
});

function createTestChild(overrides: Partial<Parameters<typeof createChildProfile>[0]> = {}) {
  return createChildProfile({
    displayName: "Player",
    gradeLevel: 6,
    interests: [],
    avatarKey: "ember_smith",
    preferredTheme: "forge",
    tutorTone: "coach",
    dailyGoalMinutes: 10,
    ...overrides
  });
}

function answerRemainingProblems(questId: string) {
  let next = getNextProblem(questId);
  while (next) {
    const correct = store.attempts.get(next.id)!.correctAnswer;
    submitAnswer(next.id, correct, 12);
    next = getNextProblem(questId);
  }
}

function attemptsForQuest(questId: string) {
  return [...store.attempts.values()]
    .filter((attempt) => attempt.questId === questId)
    .sort((a, b) => Number(a.metadata.order) - Number(b.metadata.order));
}
