import type { Domain, Skill, Subject } from "../types/domain.js";

export const SUBJECT_IDS = {
  math: "subject_math",
  reading: "subject_reading",
  vocabulary: "subject_vocabulary",
  science: "subject_science",
  history: "subject_history",
  coding: "subject_coding"
} as const;

export const subjects: Subject[] = [
  { id: SUBJECT_IDS.math, name: "Math", slug: "math", description: "Deterministic math practice and problem solving.", status: "active", displayOrder: 1 },
  { id: SUBJECT_IDS.reading, name: "Reading", slug: "reading", description: "Short comprehension practice for daily quests.", status: "active", displayOrder: 2 },
  { id: SUBJECT_IDS.vocabulary, name: "Vocabulary", slug: "vocabulary", description: "Word meaning and usage practice.", status: "active", displayOrder: 3 },
  { id: SUBJECT_IDS.science, name: "Science", slug: "science", description: "Future science reasoning activities.", status: "inactive", displayOrder: 4 },
  { id: SUBJECT_IDS.history, name: "History", slug: "history", description: "Future social studies and history activities.", status: "inactive", displayOrder: 5 },
  { id: SUBJECT_IDS.coding, name: "Coding", slug: "coding", description: "Future computational thinking activities.", status: "inactive", displayOrder: 6 }
];

const domain = (subjectId: string, slug: string, name: string, description: string, displayOrder: number): Domain => ({
  id: `domain_${slug.replaceAll("-", "_")}`,
  subjectId,
  name,
  slug,
  description,
  status: "active",
  displayOrder
});

export const skillDomains: Domain[] = [
  domain(SUBJECT_IDS.math, "fractions", "Fractions", "Fraction sense and operations.", 1),
  domain(SUBJECT_IDS.math, "decimals", "Decimals", "Decimal place value and operations.", 2),
  domain(SUBJECT_IDS.math, "ratios", "Ratios", "Ratios, rates, and scaling.", 3),
  domain(SUBJECT_IDS.math, "negative-numbers", "Negative Numbers", "Integer comparison and operations.", 4),
  domain(SUBJECT_IDS.math, "pre-algebra", "Pre-Algebra", "Variables, expressions, and equations.", 5),
  domain(SUBJECT_IDS.math, "geometry", "Geometry", "Area, perimeter, coordinates, and volume.", 6),
  domain(SUBJECT_IDS.reading, "reading-comprehension", "Reading Comprehension", "Main idea, sequence, and inference from short passages.", 1),
  domain(SUBJECT_IDS.vocabulary, "word-meaning", "Word Meaning", "Context clues, synonyms, and precise word usage.", 1)
];

export const domains = skillDomains;

const skill = (subjectId: string, domainId: string, slug: string, name: string, displayOrder: number, gradeBand = "5-6"): Skill => ({
  id: `skill_${slug.replaceAll("-", "_")}`,
  subjectId,
  domainId,
  name,
  slug,
  description: name,
  gradeBand,
  status: "active",
  displayOrder
});

export const skills: Skill[] = [
  skill(SUBJECT_IDS.math, "domain_fractions", "equivalent-fractions", "Equivalent Fractions", 1),
  skill(SUBJECT_IDS.math, "domain_fractions", "simplifying-fractions", "Simplifying Fractions", 2),
  skill(SUBJECT_IDS.math, "domain_fractions", "comparing-fractions", "Comparing Fractions", 3),
  skill(SUBJECT_IDS.math, "domain_fractions", "add-fractions-common-denominators", "Adding Fractions with Common Denominators", 4),
  skill(SUBJECT_IDS.math, "domain_fractions", "add-fractions-unlike-denominators", "Adding Fractions with Unlike Denominators", 5),
  skill(SUBJECT_IDS.math, "domain_decimals", "comparing-decimals", "Comparing Decimals", 1),
  skill(SUBJECT_IDS.math, "domain_decimals", "adding-decimals", "Adding Decimals", 2),
  skill(SUBJECT_IDS.math, "domain_decimals", "subtracting-decimals", "Subtracting Decimals", 3),
  skill(SUBJECT_IDS.math, "domain_decimals", "decimal-place-value", "Decimal Place Value", 4),
  skill(SUBJECT_IDS.math, "domain_ratios", "equivalent-ratios", "Equivalent Ratios", 1),
  skill(SUBJECT_IDS.math, "domain_ratios", "unit-rates", "Unit Rates", 2),
  skill(SUBJECT_IDS.math, "domain_ratios", "scale-ratios", "Scaling Ratios", 3),
  skill(SUBJECT_IDS.math, "domain_negative_numbers", "compare-integers", "Comparing Integers", 1),
  skill(SUBJECT_IDS.math, "domain_negative_numbers", "add-integers", "Adding Integers", 2),
  skill(SUBJECT_IDS.math, "domain_negative_numbers", "subtract-integers", "Subtracting Integers", 3),
  skill(SUBJECT_IDS.math, "domain_pre_algebra", "evaluate-expressions", "Evaluate Expressions", 1),
  skill(SUBJECT_IDS.math, "domain_pre_algebra", "one-step-equations-addition", "One-Step Addition Equations", 2),
  skill(SUBJECT_IDS.math, "domain_pre_algebra", "one-step-equations-multiplication", "One-Step Multiplication Equations", 3),
  skill(SUBJECT_IDS.math, "domain_geometry", "rectangle-area", "Area of Rectangles", 1),
  skill(SUBJECT_IDS.math, "domain_geometry", "rectangle-perimeter", "Perimeter of Rectangles", 2),
  skill(SUBJECT_IDS.math, "domain_geometry", "rectangular-prism-volume", "Volume of Rectangular Prisms", 3),
  skill(SUBJECT_IDS.reading, "domain_reading_comprehension", "main-idea", "Main Idea", 1),
  skill(SUBJECT_IDS.reading, "domain_reading_comprehension", "sequence-events", "Sequence Events", 2),
  skill(SUBJECT_IDS.reading, "domain_reading_comprehension", "reading-inference", "Reading Inference", 3),
  skill(SUBJECT_IDS.vocabulary, "domain_word_meaning", "context-clues", "Context Clues", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_word_meaning", "synonyms", "Synonyms", 2),
  skill(SUBJECT_IDS.vocabulary, "domain_word_meaning", "word-usage", "Word Usage", 3)
];

export const DEFAULT_FOCUS_SKILL_ID = "skill_equivalent_fractions";
