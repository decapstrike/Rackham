import { describe, expect, it } from "vitest";
import { ACTIVITY_TYPES, activityTemplates, domains, skills, subjects } from "../index.js";
import { generateActivity, mvpActivityTypes } from "./generators.js";
import { validateActivityAnswer, validateActivityGeneratorRegistry, validateGeneratedActivity, validateLearningSeeds } from "./validators.js";

describe("learning engine primitives", () => {
  it("defines active MVP subjects and inactive future subjects", () => {
    expect(subjects.filter((subject) => subject.status === "active").map((subject) => subject.slug)).toEqual(["math", "reading", "vocabulary"]);
    expect(subjects.filter((subject) => subject.status === "inactive").map((subject) => subject.slug)).toEqual(["writing", "science", "history", "study_skills"]);
    expect(subjects.map((subject) => subject.roomName)).toContain("Library of Echoes");
  });

  it("keeps domains and skills linked to subjects", () => {
    expect(validateLearningSeeds()).toEqual({ valid: true, errors: [] });
    expect(domains.find((domain) => domain.slug === "reading-comprehension")?.subjectId).toBe("subject_reading");
    expect(skills.find((skill) => skill.slug === "prefix-meaning")?.subjectId).toBe("subject_vocabulary");
  });

  it("covers every MVP activity type with a template and generator", () => {
    expect(mvpActivityTypes).toEqual(ACTIVITY_TYPES);
    expect(activityTemplates.map((template) => template.activityType).sort()).toEqual([...ACTIVITY_TYPES].sort());
    expect(validateActivityGeneratorRegistry()).toEqual({ valid: true, errors: [] });
  });

  it("generates valid reading and vocabulary activities", () => {
    for (const activityType of [
      "reading_main_idea_multiple_choice",
      "reading_supporting_detail_multiple_choice",
      "reading_sequence_events",
      "reading_inference_multiple_choice",
      "reading_context_clue_multiple_choice",
      "vocabulary_definition_match",
      "vocabulary_context_clue_multiple_choice",
      "vocabulary_context_sentence_choice",
      "vocabulary_synonym_multiple_choice",
      "vocabulary_antonym_choice",
      "vocabulary_prefix_meaning_choice",
      "vocabulary_word_usage_text"
    ] as const) {
      const activity = generateActivity(activityType, { difficulty: 2, seed: 1 });
      expect(activity.activityType).toBe(activityType);
      expect(validateGeneratedActivity(activity)).toEqual({ valid: true, errors: [] });
      expect(activity.hintSequence).toHaveLength(3);
      expect(activity.metadata).not.toEqual({});
    }
  });

  it("adapts math generators into generated activity compatibility", () => {
    const activity = generateActivity("equivalent_fraction_multiple_choice", { difficulty: 2 });
    expect(activity.subjectId).toBe("subject_math");
    expect(activity.domainId).toBe("domain_fractions");
    expect(activity.activityType).toBe("equivalent_fraction_multiple_choice");
    expect("problemType" in activity).toBe(true);
    expect(validateGeneratedActivity(activity)).toEqual({ valid: true, errors: [] });
  });

  it("validates deterministic answers across activity formats", () => {
    const multipleChoice = generateActivity("reading_main_idea_multiple_choice", { seed: 0 });
    expect(validateActivityAnswer(multipleChoice, multipleChoice.correctAnswer).isCorrect).toBe(true);
    expect(validateActivityAnswer(multipleChoice, "Z").isCorrect).toBe(false);

    const ordered = generateActivity("reading_sequence_events", { seed: 0 });
    expect(ordered.answerFormat).toBe("ordered_list");
    expect(validateActivityAnswer(ordered, "B, C, A").isCorrect).toBe(true);
    expect(validateActivityAnswer(ordered, "A,B,C").isCorrect).toBe(false);
  });
});
