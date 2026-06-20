import { describe, expect, it } from "vitest";
import {
  completeQuest,
  createChildProfile,
  createDailyQuest,
  getNextProblem,
  parentSummary,
  requestHint,
  store,
  submitAnswer
} from "./store.js";

describe("MathForge store quest lifecycle", () => {
  it("runs the daily quest loop with personalized presentation", async () => {
    const child = createChildProfile({
      displayName: "Player",
      gradeLevel: 6,
      interests: ["soccer"],
      avatarKey: "gear_knight",
      preferredTheme: "forge",
      tutorTone: "coach",
      dailyGoalMinutes: 10
    });

    const quest = await createDailyQuest(child.id, 8);
    expect(quest.presentation?.title).toContain("Playbook");
    expect(quest.presentation?.environment).toBe("arena_keep");

    for (let i = 0; i < 8; i += 1) {
      const next = getNextProblem(quest.id);
      expect((next as Record<string, unknown>)?.correctAnswer).toBeUndefined();
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
});
