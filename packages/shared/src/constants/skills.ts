import type { Domain, Skill, Subject } from "../types/domain.js";

export const SUBJECT_IDS = {
  math: "subject_math",
  reading: "subject_reading",
  vocabulary: "subject_vocabulary",
  writing: "subject_writing",
  science: "subject_science",
  history: "subject_history",
  studySkills: "subject_study_skills"
} as const;

export const subjects: Subject[] = [
  { id: SUBJECT_IDS.math, name: "Math", slug: "math", roomName: "Number Forge", description: "Power machines with numbers, patterns, equations, and logic.", status: "active", isActive: true, displayOrder: 1 },
  { id: SUBJECT_IDS.reading, name: "Reading", slug: "reading", roomName: "Library of Echoes", description: "Decode passages, meanings, main ideas, and hidden details.", status: "active", isActive: true, displayOrder: 2 },
  { id: SUBJECT_IDS.vocabulary, name: "Vocabulary", slug: "vocabulary", roomName: "Lexicon Vault", description: "Unlock word meanings, roots, context clues, and usage.", status: "active", isActive: true, displayOrder: 3 },
  { id: SUBJECT_IDS.writing, name: "Writing", slug: "writing", roomName: "Scriptorium", description: "Strengthen sentences, arguments, paragraphs, and stories.", status: "inactive", isActive: false, displayOrder: 4 },
  { id: SUBJECT_IDS.science, name: "Science", slug: "science", roomName: "Discovery Lab", description: "Investigate living systems, matter, forces, Earth, and space.", status: "inactive", isActive: false, displayOrder: 5 },
  { id: SUBJECT_IDS.history, name: "History", slug: "history", roomName: "Timeline Hall", description: "Place people, events, causes, and consequences in context.", status: "inactive", isActive: false, displayOrder: 6 },
  { id: SUBJECT_IDS.studySkills, name: "Study Skills", slug: "study_skills", roomName: "Strategy Room", description: "Build habits for memory, planning, focus, and test readiness.", status: "inactive", isActive: false, displayOrder: 7 }
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
  domain(SUBJECT_IDS.reading, "reading-comprehension", "Reading Comprehension", "Main idea, supporting details, and sequence from short passages.", 1),
  domain(SUBJECT_IDS.reading, "reading-inference", "Inference", "Use clues and text evidence to understand unstated ideas.", 2),
  domain(SUBJECT_IDS.reading, "reading-vocabulary-context", "Vocabulary in Context", "Determine word meaning from passage clues.", 3),
  domain(SUBJECT_IDS.vocabulary, "word-meaning", "Word Meaning", "Definitions and precise word usage.", 1),
  domain(SUBJECT_IDS.vocabulary, "vocabulary-context-clues", "Context Clues", "Use sentence clues to choose fitting words.", 2),
  domain(SUBJECT_IDS.vocabulary, "synonyms-antonyms", "Synonyms and Antonyms", "Compare words with similar and opposite meanings.", 3),
  domain(SUBJECT_IDS.vocabulary, "prefixes-suffixes", "Prefixes and Suffixes", "Use word parts to infer meaning and usage.", 4)
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
  skill(SUBJECT_IDS.reading, "domain_reading_comprehension", "supporting-detail", "Supporting Detail", 2),
  skill(SUBJECT_IDS.reading, "domain_reading_comprehension", "sequence-events", "Sequence Events", 3),
  skill(SUBJECT_IDS.reading, "domain_reading_inference", "reading-inference", "Reading Inference", 1),
  skill(SUBJECT_IDS.reading, "domain_reading_vocabulary_context", "reading-context-clues", "Context Clues in Reading", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_word_meaning", "definition-match", "Match Word to Definition", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_vocabulary_context_clues", "context-sentence-choice", "Choose Word from Context", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_synonyms_antonyms", "synonyms", "Synonyms", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_synonyms_antonyms", "antonyms", "Antonyms", 2),
  skill(SUBJECT_IDS.vocabulary, "domain_prefixes_suffixes", "prefix-meaning", "Prefix Meaning", 1),
  skill(SUBJECT_IDS.vocabulary, "domain_word_meaning", "word-usage", "Word Usage", 2)
];

export const DEFAULT_FOCUS_SKILL_ID = "skill_equivalent_fractions";
