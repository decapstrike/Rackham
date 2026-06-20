import type { ActivityTemplate, ActivityType, ProblemType, ReadingActivityType, VocabularyActivityType } from "../types/domain.js";
import { SUBJECT_IDS } from "./skills.js";

export const MATH_ACTIVITY_TYPES = [
  "equivalent_fraction_multiple_choice",
  "simplify_fraction",
  "compare_fractions",
  "add_fractions_common_denominator",
  "add_fractions_unlike_denominator",
  "compare_decimals",
  "add_decimals",
  "subtract_decimals",
  "decimal_place_value",
  "equivalent_ratios",
  "unit_rate_simple",
  "scale_ratio",
  "compare_integers",
  "add_integers",
  "subtract_integers",
  "evaluate_expression",
  "solve_one_step_equation_addition",
  "solve_one_step_equation_multiplication",
  "rectangle_area",
  "rectangle_perimeter",
  "rectangular_prism_volume"
] as const satisfies readonly ProblemType[];

export const READING_ACTIVITY_TYPES = [
  "reading_main_idea_multiple_choice",
  "reading_sequence_events",
  "reading_inference_multiple_choice"
] as const satisfies readonly ReadingActivityType[];

export const VOCABULARY_ACTIVITY_TYPES = [
  "vocabulary_context_clue_multiple_choice",
  "vocabulary_synonym_multiple_choice",
  "vocabulary_word_usage_text"
] as const satisfies readonly VocabularyActivityType[];

export const ACTIVITY_TYPES = [
  ...MATH_ACTIVITY_TYPES,
  ...READING_ACTIVITY_TYPES,
  ...VOCABULARY_ACTIVITY_TYPES
] as const satisfies readonly ActivityType[];

const template = (
  activityType: ActivityType,
  subjectId: string,
  domainId: string,
  skillId: string,
  title: string,
  answerFormat: ActivityTemplate["answerFormat"]
): ActivityTemplate => ({
  id: `template_${activityType}`,
  subjectId,
  domainId,
  skillId,
  activityType,
  title,
  description: title,
  answerFormat,
  difficultyMin: 1,
  difficultyMax: 5,
  status: "active"
});

const mathTemplateConfig = {
  equivalent_fraction_multiple_choice: ["domain_fractions", "skill_equivalent_fractions", "Equivalent fraction choice", "multiple_choice"],
  simplify_fraction: ["domain_fractions", "skill_simplifying_fractions", "Simplify a fraction", "numeric"],
  compare_fractions: ["domain_fractions", "skill_comparing_fractions", "Compare fractions", "text"],
  add_fractions_common_denominator: ["domain_fractions", "skill_add_fractions_common_denominators", "Add fractions with common denominators", "numeric"],
  add_fractions_unlike_denominator: ["domain_fractions", "skill_add_fractions_unlike_denominators", "Add fractions with unlike denominators", "numeric"],
  compare_decimals: ["domain_decimals", "skill_comparing_decimals", "Compare decimals", "text"],
  add_decimals: ["domain_decimals", "skill_adding_decimals", "Add decimals", "numeric"],
  subtract_decimals: ["domain_decimals", "skill_subtracting_decimals", "Subtract decimals", "numeric"],
  decimal_place_value: ["domain_decimals", "skill_decimal_place_value", "Identify decimal place value", "numeric"],
  equivalent_ratios: ["domain_ratios", "skill_equivalent_ratios", "Find an equivalent ratio", "numeric"],
  unit_rate_simple: ["domain_ratios", "skill_unit_rates", "Find a unit rate", "numeric"],
  scale_ratio: ["domain_ratios", "skill_scale_ratios", "Scale a ratio", "numeric"],
  compare_integers: ["domain_negative_numbers", "skill_compare_integers", "Compare integers", "text"],
  add_integers: ["domain_negative_numbers", "skill_add_integers", "Add integers", "numeric"],
  subtract_integers: ["domain_negative_numbers", "skill_subtract_integers", "Subtract integers", "numeric"],
  evaluate_expression: ["domain_pre_algebra", "skill_evaluate_expressions", "Evaluate an expression", "numeric"],
  solve_one_step_equation_addition: ["domain_pre_algebra", "skill_one_step_equations_addition", "Solve an addition equation", "numeric"],
  solve_one_step_equation_multiplication: ["domain_pre_algebra", "skill_one_step_equations_multiplication", "Solve a multiplication equation", "numeric"],
  rectangle_area: ["domain_geometry", "skill_rectangle_area", "Find rectangle area", "numeric"],
  rectangle_perimeter: ["domain_geometry", "skill_rectangle_perimeter", "Find rectangle perimeter", "numeric"],
  rectangular_prism_volume: ["domain_geometry", "skill_rectangular_prism_volume", "Find rectangular prism volume", "numeric"]
} satisfies Record<ProblemType, [string, string, string, ActivityTemplate["answerFormat"]]>;

export const mathActivityTemplates = MATH_ACTIVITY_TYPES.map((activityType) => {
  const [domainId, skillId, title, answerFormat] = mathTemplateConfig[activityType];
  return template(activityType, SUBJECT_IDS.math, domainId, skillId, title, answerFormat);
});

export const activityTemplates: ActivityTemplate[] = [
  ...mathActivityTemplates,
  template("reading_main_idea_multiple_choice", SUBJECT_IDS.reading, "domain_reading_comprehension", "skill_main_idea", "Find the main idea", "multiple_choice"),
  template("reading_sequence_events", SUBJECT_IDS.reading, "domain_reading_comprehension", "skill_sequence_events", "Put events in order", "multiple_choice"),
  template("reading_inference_multiple_choice", SUBJECT_IDS.reading, "domain_reading_comprehension", "skill_reading_inference", "Make an inference", "multiple_choice"),
  template("vocabulary_context_clue_multiple_choice", SUBJECT_IDS.vocabulary, "domain_word_meaning", "skill_context_clues", "Use context clues", "multiple_choice"),
  template("vocabulary_synonym_multiple_choice", SUBJECT_IDS.vocabulary, "domain_word_meaning", "skill_synonyms", "Choose a synonym", "multiple_choice"),
  template("vocabulary_word_usage_text", SUBJECT_IDS.vocabulary, "domain_word_meaning", "skill_word_usage", "Use the word correctly", "text")
];

export function isActivityType(value: string): value is ActivityType {
  return (ACTIVITY_TYPES as readonly string[]).includes(value);
}
