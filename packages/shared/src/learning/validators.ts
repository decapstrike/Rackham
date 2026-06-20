import type { ActivityType, AnswerFormat, GeneratedActivity } from "../types/domain.js";
import { ACTIVITY_TYPES, activityTemplates } from "../constants/activityTypes.js";
import { domains, skills, subjects } from "../constants/skills.js";
import { activityGeneratorRegistry } from "./generators.js";

export type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export type ActivityAnswerValidationResult = {
  isCorrect: boolean;
  score: number;
  maxScore: number;
  normalizedAnswer: string;
  feedbackCode?: string;
};

const ok = (errors: string[]): ValidationResult => ({ valid: errors.length === 0, errors });

export function validateLearningSeeds(): ValidationResult {
  const errors: string[] = [];
  const subjectIds = new Set(subjects.map((subject) => subject.id));
  const domainIds = new Set(domains.map((domain) => domain.id));
  const skillIds = new Set(skills.map((skill) => skill.id));

  for (const domain of domains) {
    if (!subjectIds.has(domain.subjectId)) errors.push(`Domain ${domain.id} references missing subject ${domain.subjectId}.`);
  }

  for (const skill of skills) {
    if (!subjectIds.has(skill.subjectId)) errors.push(`Skill ${skill.id} references missing subject ${skill.subjectId}.`);
    if (!domainIds.has(skill.domainId)) errors.push(`Skill ${skill.id} references missing domain ${skill.domainId}.`);
  }

  for (const template of activityTemplates) {
    if (!subjectIds.has(template.subjectId)) errors.push(`Template ${template.id} references missing subject ${template.subjectId}.`);
    if (!domainIds.has(template.domainId)) errors.push(`Template ${template.id} references missing domain ${template.domainId}.`);
    if (!skillIds.has(template.skillId)) errors.push(`Template ${template.id} references missing skill ${template.skillId}.`);
    if (template.difficultyMin < 1 || template.difficultyMax > 5 || template.difficultyMin > template.difficultyMax) {
      errors.push(`Template ${template.id} has invalid difficulty bounds.`);
    }
  }

  return ok(errors);
}

export function validateActivityGeneratorRegistry(): ValidationResult {
  const errors: string[] = [];

  for (const activityType of ACTIVITY_TYPES) {
    if (!activityGeneratorRegistry[activityType]) errors.push(`Missing generator for ${activityType}.`);
  }

  for (const activityType of Object.keys(activityGeneratorRegistry)) {
    if (!(ACTIVITY_TYPES as readonly string[]).includes(activityType)) errors.push(`Unexpected generator for ${activityType}.`);
  }

  return ok(errors);
}

export function validateGeneratedActivity(activity: GeneratedActivity): ValidationResult {
  const errors: string[] = [];
  const choiceIds = new Set(activity.choices?.map((choice) => choice.id) ?? []);

  if (!(ACTIVITY_TYPES as readonly string[]).includes(activity.activityType)) errors.push(`Unknown activity type ${activity.activityType}.`);
  if (!subjects.some((subject) => subject.id === activity.subjectId)) errors.push(`Unknown subject ${activity.subjectId}.`);
  if (!domains.some((domain) => domain.id === activity.domainId && domain.subjectId === activity.subjectId)) {
    errors.push(`Domain ${activity.domainId} does not belong to subject ${activity.subjectId}.`);
  }
  if (!skills.some((skill) => skill.id === activity.skillId && skill.domainId === activity.domainId)) {
    errors.push(`Skill ${activity.skillId} does not belong to domain ${activity.domainId}.`);
  }
  if (activity.prompt.trim().length < 6) errors.push("Prompt is too short.");
  if (String(activity.correctAnswer).trim().length === 0) errors.push("Correct answer is empty.");
  if (activity.explanation.trim().length === 0) errors.push("Explanation is empty.");
  if (activity.hintSequence.length !== 3) errors.push("Activity must include exactly three hints.");
  if (activity.difficulty < 1 || activity.difficulty > 5) errors.push("Difficulty must be between 1 and 5.");
  if (activity.answerFormat === "multiple_choice" && (!activity.choices || !choiceIds.has(activity.correctAnswer))) {
    errors.push("Multiple choice activity must include choices with the correct answer id.");
  }
  if (activity.answerFormat === "ordered_list") {
    const expectedIds = normalizeOrderedList(activity.correctAnswer);
    if (!activity.choices || expectedIds.some((id) => !choiceIds.has(id))) {
      errors.push("Ordered list activity must include choices for every correct answer id.");
    }
  }

  return ok(errors);
}

export function validateActivityAnswer(activity: GeneratedActivity, submittedAnswer: unknown): ActivityAnswerValidationResult {
  const answerFormat = activity.answerFormat;
  const normalizedSubmitted = normalizeAnswer(submittedAnswer, answerFormat);
  const normalizedCorrect = normalizeAnswer(activity.correctAnswer, answerFormat);
  const isCorrect = normalizedSubmitted === normalizedCorrect;

  return {
    isCorrect,
    score: isCorrect ? 1 : 0,
    maxScore: 1,
    normalizedAnswer: normalizedSubmitted,
    feedbackCode: isCorrect ? "correct" : "needs_retry"
  };
}

export function assertValidActivityType(activityType: string): asserts activityType is ActivityType {
  if (!(ACTIVITY_TYPES as readonly string[]).includes(activityType)) {
    throw new Error(`Unknown activity type: ${activityType}`);
  }
}

function normalizeAnswer(answer: unknown, answerFormat: AnswerFormat): string {
  if (answerFormat === "ordered_list") return normalizeOrderedList(answer).join(",");
  if (answerFormat === "numeric") return normalizeNumeric(answer);
  return String(answer ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

function normalizeOrderedList(answer: unknown): string[] {
  if (Array.isArray(answer)) return answer.map((item) => String(item).trim().toUpperCase()).filter(Boolean);
  return String(answer ?? "")
    .split(/[,\n>]+/)
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
}

function normalizeNumeric(answer: unknown): string {
  const raw = String(answer ?? "").trim();
  const parsed = Number(raw);
  if (Number.isFinite(parsed)) return String(Number(parsed.toFixed(6)));
  return raw.toLowerCase().replace(/\s+/g, "");
}
