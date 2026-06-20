import type { GeneratedProblem, ProblemType } from "../types/domain.js";
import { SUBJECT_IDS } from "../constants/skills.js";
import { fractionToString, simplify } from "./fractions.js";

type GeneratorInput = { difficulty?: number; seed?: number };
type Generator = (input?: GeneratorInput) => GeneratedProblem;

const ids = {
  equivalent_fraction_multiple_choice: "skill_equivalent_fractions",
  simplify_fraction: "skill_simplifying_fractions",
  compare_fractions: "skill_comparing_fractions",
  add_fractions_common_denominator: "skill_add_fractions_common_denominators",
  add_fractions_unlike_denominator: "skill_add_fractions_unlike_denominators",
  compare_decimals: "skill_comparing_decimals",
  add_decimals: "skill_adding_decimals",
  subtract_decimals: "skill_subtracting_decimals",
  decimal_place_value: "skill_decimal_place_value",
  equivalent_ratios: "skill_equivalent_ratios",
  unit_rate_simple: "skill_unit_rates",
  scale_ratio: "skill_scale_ratios",
  compare_integers: "skill_compare_integers",
  add_integers: "skill_add_integers",
  subtract_integers: "skill_subtract_integers",
  evaluate_expression: "skill_evaluate_expressions",
  solve_one_step_equation_addition: "skill_one_step_equations_addition",
  solve_one_step_equation_multiplication: "skill_one_step_equations_multiplication",
  rectangle_area: "skill_rectangle_area",
  rectangle_perimeter: "skill_rectangle_perimeter",
  rectangular_prism_volume: "skill_rectangular_prism_volume"
} satisfies Record<ProblemType, string>;

const domains = {
  equivalent_fraction_multiple_choice: "domain_fractions",
  simplify_fraction: "domain_fractions",
  compare_fractions: "domain_fractions",
  add_fractions_common_denominator: "domain_fractions",
  add_fractions_unlike_denominator: "domain_fractions",
  compare_decimals: "domain_decimals",
  add_decimals: "domain_decimals",
  subtract_decimals: "domain_decimals",
  decimal_place_value: "domain_decimals",
  equivalent_ratios: "domain_ratios",
  unit_rate_simple: "domain_ratios",
  scale_ratio: "domain_ratios",
  compare_integers: "domain_negative_numbers",
  add_integers: "domain_negative_numbers",
  subtract_integers: "domain_negative_numbers",
  evaluate_expression: "domain_pre_algebra",
  solve_one_step_equation_addition: "domain_pre_algebra",
  solve_one_step_equation_multiplication: "domain_pre_algebra",
  rectangle_area: "domain_geometry",
  rectangle_perimeter: "domain_geometry",
  rectangular_prism_volume: "domain_geometry"
} satisfies Record<ProblemType, string>;

const choice = (correct: string, options: string[]) => options.map((text, index) => ({ id: String.fromCharCode(65 + index), text })).find((c) => c.text === correct)?.id ?? "A";
const base = (problemType: ProblemType, prompt: string, correctAnswer: string, explanation: string, hintSequence: string[], difficulty = 1, metadata: Record<string, unknown> = {}): GeneratedProblem => ({
  subjectId: SUBJECT_IDS.math,
  domainId: domains[problemType],
  skillId: ids[problemType],
  activityType: problemType,
  problemType,
  prompt,
  answerFormat: "numeric",
  correctAnswer,
  explanation,
  hintSequence,
  difficulty,
  metadata
});

export const problemGenerators: Record<ProblemType, Generator> = {
  equivalent_fraction_multiple_choice: ({ difficulty = 1 } = {}) => {
    const source = { n: 1 + difficulty, d: 2 + difficulty };
    const correct = fractionToString({ n: source.n * 2, d: source.d * 2 });
    const options = [fractionToString(source), correct, `${source.n + 1}/${source.d + 2}`, `${source.n * 3}/${source.d * 2}`];
    return { ...base("equivalent_fraction_multiple_choice", `Which fraction is equivalent to ${fractionToString(source)}?`, choice(correct, options), `${correct} is equivalent because top and bottom were multiplied by 2.`, ["Equivalent fractions have the same value.", "Multiply numerator and denominator by the same number.", `Doubling ${fractionToString(source)} gives ${correct}.`], difficulty, { source }), answerFormat: "multiple_choice", choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text })) };
  },
  simplify_fraction: ({ difficulty = 1 } = {}) => {
    const f = { n: 2 * (difficulty + 1), d: 4 * (difficulty + 1) };
    return base("simplify_fraction", `Simplify ${f.n}/${f.d}.`, fractionToString(f), `Divide the numerator and denominator by ${f.n / simplify(f).n}.`, ["Look for a common factor.", "Divide top and bottom by the same number.", `${f.n}/${f.d} simplifies to ${fractionToString(f)}.`], difficulty, { f });
  },
  compare_fractions: ({ difficulty = 1 } = {}) => {
    const a = { n: difficulty + 1, d: difficulty + 3 };
    const b = { n: difficulty + 2, d: difficulty + 5 };
    const answer = a.n * b.d > b.n * a.d ? ">" : "<";
    return { ...base("compare_fractions", `Compare: ${fractionToString(a)} __ ${fractionToString(b)}. Type >, <, or =.`, answer, "Use cross products or common denominators to compare.", ["Fractions are easier to compare with matching denominators.", "Cross multiply the numerator of each with the other denominator.", `${a.n} x ${b.d} and ${b.n} x ${a.d} decide the comparison.`], difficulty, { a, b }), answerFormat: "text" };
  },
  add_fractions_common_denominator: ({ difficulty = 1 } = {}) => {
    const d = difficulty + 5;
    const answer = fractionToString({ n: difficulty + 3, d });
    return base("add_fractions_common_denominator", `Add ${1}/${d} + ${difficulty + 2}/${d}.`, answer, "When denominators match, add numerators and keep the denominator.", ["The pieces are the same size.", "Add the top numbers only.", `1 + ${difficulty + 2} = ${difficulty + 3}.`], difficulty, { d });
  },
  add_fractions_unlike_denominator: ({ difficulty = 1 } = {}) => {
    const a = { n: 1, d: 2 + difficulty };
    const b = { n: 1, d: 3 + difficulty };
    const answer = fractionToString({ n: a.n * b.d + b.n * a.d, d: a.d * b.d });
    return base("add_fractions_unlike_denominator", `Add ${fractionToString(a)} + ${fractionToString(b)}.`, answer, "Use a common denominator, then add numerators.", ["The denominators need to match first.", `A common denominator is ${a.d * b.d}.`, `Rewrite both fractions over ${a.d * b.d}, then add.`], difficulty, { a, b });
  },
  compare_decimals: ({ difficulty = 1 } = {}) => ({ ...base("compare_decimals", `Compare: ${difficulty}.4 __ ${difficulty}.35. Type >, <, or =.`, ">", "Line up place values before comparing.", ["Line up the decimal points.", "Compare tenths first, then hundredths.", `${difficulty}.40 is greater than ${difficulty}.35.`], difficulty), answerFormat: "text" }),
  add_decimals: ({ difficulty = 1 } = {}) => {
    const a = Number(`${difficulty + 1}.1`);
    const b = Number(`0.${difficulty + 2}`);
    return base("add_decimals", `Add ${a.toFixed(1)} + ${b.toFixed(1)}.`, (a + b).toFixed(1), "Line up decimals and add by place value.", ["Stack the decimal points.", "Add tenths to tenths.", "Keep the decimal point in the answer."], difficulty);
  },
  subtract_decimals: ({ difficulty = 1 } = {}) => {
    const a = Number(`${difficulty + 5}.0`);
    const b = Number(`1.${difficulty}`);
    return base("subtract_decimals", `Subtract ${a.toFixed(1)} - ${b.toFixed(1)}.`, (a - b).toFixed(1), "Line up decimals and subtract by place value.", ["Stack the decimal points.", "Subtract tenths from tenths.", "Keep the decimal point lined up."], difficulty);
  },
  decimal_place_value: ({ difficulty = 1 } = {}) => ({ ...base("decimal_place_value", `In ${difficulty}.47, what digit is in the tenths place?`, "4", "The tenths place is the first digit after the decimal.", ["Look right after the decimal point.", "Tenths means one place after the decimal.", "The first digit after the decimal is 4."], difficulty), answerFormat: "numeric" }),
  equivalent_ratios: ({ difficulty = 1 } = {}) => base("equivalent_ratios", `Complete the equivalent ratio: ${difficulty + 2}:3 = ?:${(difficulty + 1) * 3}`, `${(difficulty + 2) * (difficulty + 1)}`, "Scale both parts of the ratio by the same factor.", ["Ratios stay equivalent when both sides scale equally.", `3 became ${(difficulty + 1) * 3}.`, `Multiply ${difficulty + 2} by ${difficulty + 1}.`], difficulty),
  unit_rate_simple: ({ difficulty = 1 } = {}) => base("unit_rate_simple", `${difficulty + 2} notebooks cost $${(difficulty + 2) * 3}. What is the cost per notebook?`, "3", "Divide total cost by number of notebooks.", ["Unit rate means for one.", "Divide dollars by notebooks.", `Each notebook costs $3.`], difficulty),
  scale_ratio: ({ difficulty = 1 } = {}) => base("scale_ratio", `A recipe uses ${difficulty + 2} cups flour for 2 batches. How many cups for 6 batches?`, `${(difficulty + 2) * 3}`, "Six batches is three times two batches, so triple the flour.", ["Find the scale factor.", "2 batches to 6 batches is x3.", "Triple the cups of flour."], difficulty),
  compare_integers: ({ difficulty = 1 } = {}) => ({ ...base("compare_integers", `Compare: -${difficulty + 4} __ -${difficulty + 2}. Type >, <, or =.`, "<", "On the number line, farther left is smaller.", ["Negative numbers get smaller as they move left.", "Compare positions on the number line.", `-${difficulty + 4} is left of -${difficulty + 2}.`], difficulty), answerFormat: "text" }),
  add_integers: ({ difficulty = 1 } = {}) => base("add_integers", `Add -${difficulty + 2} + ${difficulty + 5}.`, "3", "Adding a positive moves right on the number line.", ["Start at the negative number.", "Move right by the positive amount.", "You land on 3."], difficulty),
  subtract_integers: ({ difficulty = 1 } = {}) => base("subtract_integers", `Subtract ${difficulty + 2} - ${difficulty + 5}.`, "-3", "Subtracting a larger number crosses below zero.", ["This asks how far below zero you go.", `${difficulty + 5} is 3 more than ${difficulty + 2}.`, "The answer is -3."], difficulty),
  evaluate_expression: ({ difficulty = 1 } = {}) => base("evaluate_expression", `Evaluate 3x + 2 when x = ${difficulty + 2}.`, `${3 * (difficulty + 2) + 2}`, "Substitute the value for x, then multiply before adding.", ["Replace x with the given number.", "Multiply before adding.", `3 x ${difficulty + 2} + 2.`], difficulty),
  solve_one_step_equation_addition: ({ difficulty = 1 } = {}) => base("solve_one_step_equation_addition", `Solve x + ${difficulty + 4} = ${difficulty + 11}.`, "7", "Undo addition by subtracting the same number from both sides.", ["Use the inverse operation.", `Subtract ${difficulty + 4} from both sides.`, "x = 7."], difficulty),
  solve_one_step_equation_multiplication: ({ difficulty = 1 } = {}) => base("solve_one_step_equation_multiplication", `Solve ${difficulty + 2}x = ${(difficulty + 2) * 4}.`, "4", "Undo multiplication by dividing both sides.", ["Use the inverse operation.", `Divide both sides by ${difficulty + 2}.`, "x = 4."], difficulty),
  rectangle_area: ({ difficulty = 1 } = {}) => base("rectangle_area", `A rectangle is ${difficulty + 4} units long and 3 units wide. What is its area?`, `${(difficulty + 4) * 3}`, "Area of a rectangle is length times width.", ["Area covers the inside.", "Multiply length by width.", `${difficulty + 4} x 3.`], difficulty),
  rectangle_perimeter: ({ difficulty = 1 } = {}) => base("rectangle_perimeter", `A rectangle is ${difficulty + 4} units long and 3 units wide. What is its perimeter?`, `${2 * (difficulty + 4 + 3)}`, "Perimeter is the distance around the shape.", ["Add all sides.", "A rectangle has two lengths and two widths.", `2 x (${difficulty + 4} + 3).`], difficulty),
  rectangular_prism_volume: ({ difficulty = 1 } = {}) => base("rectangular_prism_volume", `A box is ${difficulty + 2} by 3 by 4 units. What is its volume?`, `${(difficulty + 2) * 3 * 4}`, "Volume is length times width times height.", ["Volume fills the box.", "Multiply all three dimensions.", `${difficulty + 2} x 3 x 4.`], difficulty)
};

export function generateProblem(problemType: ProblemType, input?: GeneratorInput): GeneratedProblem {
  return problemGenerators[problemType](input);
}

export const mvpProblemTypes = Object.keys(problemGenerators) as ProblemType[];
