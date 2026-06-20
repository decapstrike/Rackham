import { describe, expect, it } from "vitest";
import { checkAnswer } from "./answerChecker.js";
import { generateProblem, mvpProblemTypes } from "./generators.js";
import { buildDailyQuestPlan, validateDailyQuestPlan } from "./questPlan.js";

describe("math generators", () => {
  it("returns valid generated problems for every MVP type", () => {
    for (const problemType of mvpProblemTypes) {
      const problem = generateProblem(problemType, { difficulty: 2 });
      expect(problem.problemType).toBe(problemType);
      expect(problem.prompt.length).toBeGreaterThan(5);
      expect(problem.correctAnswer.length).toBeGreaterThan(0);
      expect(problem.hintSequence).toHaveLength(3);
      expect(problem.difficulty).toBeGreaterThanOrEqual(1);
      expect(problem.difficulty).toBeLessThanOrEqual(5);
      expect(checkAnswer(problem, problem.correctAnswer)).toBe(true);
    }
  });

  it("accepts equivalent fraction forms where allowed", () => {
    const problem = generateProblem("add_fractions_common_denominator", { difficulty: 1 });
    expect(checkAnswer({ ...problem, correctAnswer: "1/2" }, "2/4")).toBe(true);
  });

  it("enforces daily quest composition", () => {
    const plan = buildDailyQuestPlan();
    expect(validateDailyQuestPlan(plan)).toBe(true);
    expect(plan.filter((item) => item.role === "focus")).toHaveLength(5);
    expect(plan.filter((item) => item.role === "review")).toHaveLength(2);
    expect(plan.filter((item) => item.role === "challenge")).toHaveLength(1);
  });
});
