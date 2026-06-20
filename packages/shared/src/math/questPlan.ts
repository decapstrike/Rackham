import type { ProblemType } from "../types/domain.js";

export type QuestProblemRole = "focus" | "review" | "challenge";

export type QuestProblemPlan = {
  role: QuestProblemRole;
  problemType: ProblemType;
  difficulty: number;
};

export const DAILY_QUEST_LENGTH = 8;

export function buildDailyQuestPlan(): QuestProblemPlan[] {
  return [
    { role: "focus", problemType: "equivalent_fraction_multiple_choice", difficulty: 1 },
    { role: "focus", problemType: "simplify_fraction", difficulty: 1 },
    { role: "focus", problemType: "compare_fractions", difficulty: 2 },
    { role: "focus", problemType: "add_fractions_common_denominator", difficulty: 2 },
    { role: "focus", problemType: "add_fractions_unlike_denominator", difficulty: 3 },
    { role: "review", problemType: "compare_decimals", difficulty: 1 },
    { role: "review", problemType: "rectangle_area", difficulty: 1 },
    { role: "challenge", problemType: "add_fractions_unlike_denominator", difficulty: 4 }
  ];
}

export function validateDailyQuestPlan(plan: QuestProblemPlan[]): boolean {
  return plan.length === DAILY_QUEST_LENGTH
    && plan.filter((item) => item.role === "focus").length === 5
    && plan.filter((item) => item.role === "review").length === 2
    && plan.filter((item) => item.role === "challenge").length === 1;
}
