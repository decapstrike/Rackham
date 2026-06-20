import type { AnswerFormat, GeneratedProblem } from "../types/domain.js";
import { equivalentFractions, parseFraction } from "./fractions.js";

export function normalizeAnswer(value: string, format: AnswerFormat): string {
  const trimmed = value.trim();
  if (format === "multiple_choice") return trimmed.toUpperCase();
  if (format === "numeric") {
    if (trimmed.startsWith(".")) return `0${trimmed}`;
    if (trimmed.startsWith("-.")) return trimmed.replace("-.", "-0.");
    return trimmed.replace(/\.0+$/, "");
  }
  return trimmed.toLowerCase().replace(/\s+/g, " ");
}

export function checkAnswer(problem: Pick<GeneratedProblem, "answerFormat" | "correctAnswer" | "problemType">, submittedAnswer: string): boolean {
  const expected = normalizeAnswer(problem.correctAnswer, problem.answerFormat);
  const submitted = normalizeAnswer(submittedAnswer, problem.answerFormat);
  if (problem.answerFormat === "multiple_choice" || problem.answerFormat === "text") {
    return submitted === expected;
  }

  const submittedFraction = parseFraction(submitted);
  const expectedFraction = parseFraction(expected);
  if (submittedFraction && expectedFraction) {
    const equivalentAllowed = [
      "equivalent_fraction_multiple_choice",
      "compare_fractions",
      "add_fractions_common_denominator",
      "add_fractions_unlike_denominator"
    ].includes(problem.problemType);
    return equivalentAllowed
      ? equivalentFractions(submittedFraction, expectedFraction)
      : submittedFraction.n === expectedFraction.n && submittedFraction.d === expectedFraction.d;
  }

  return Number(submitted) === Number(expected);
}
