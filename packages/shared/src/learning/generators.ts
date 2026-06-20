import type { ActivityType, GeneratedActivity, ProblemType, ReadingActivityType, VocabularyActivityType } from "../types/domain.js";
import { MATH_ACTIVITY_TYPES, READING_ACTIVITY_TYPES, VOCABULARY_ACTIVITY_TYPES } from "../constants/activityTypes.js";
import { SUBJECT_IDS } from "../constants/skills.js";
import { generateProblem } from "../math/generators.js";

export type ActivityGeneratorInput = { difficulty?: number; seed?: number };
export type ActivityGenerator = (input?: ActivityGeneratorInput) => GeneratedActivity;

const choice = (correct: string, options: string[]) => options.map((text, index) => ({ id: String.fromCharCode(65 + index), text })).find((c) => c.text === correct)?.id ?? "A";

const readingPassages = [
  {
    title: "The Quiet Workshop",
    passage: "Maya sorted the tools before the team arrived. When everyone came in, they found the benches clear and the plans easy to follow. By lunch, the broken clock was ticking again.",
    mainIdea: "Maya's preparation helped the team finish the repair.",
    firstEvent: "Maya sorted the tools.",
    inference: "Maya is organized and helpful."
  },
  {
    title: "The Garden Map",
    passage: "Leo drew a map before planting. He marked sunny spots for tomatoes and shady corners for herbs. A month later, every plant had the light it needed.",
    mainIdea: "Leo used planning to help the garden grow well.",
    firstEvent: "Leo drew a map.",
    inference: "Leo thinks carefully before starting work."
  }
];

const vocabularyItems = [
  {
    word: "sturdy",
    sentence: "The sturdy shelf held every heavy book without bending.",
    meaning: "strong",
    synonym: "solid",
    usageAnswer: "sturdy"
  },
  {
    word: "brief",
    sentence: "The teacher gave a brief reminder before the quiz began.",
    meaning: "short",
    synonym: "quick",
    usageAnswer: "brief"
  }
];

const select = <T>(items: T[], seed = 0): T => items[Math.abs(seed) % items.length];

const readingBase = (
  activityType: ReadingActivityType,
  skillId: string,
  prompt: string,
  correctAnswer: string,
  explanation: string,
  hintSequence: string[],
  difficulty: number,
  metadata: Record<string, unknown>
): GeneratedActivity => ({
  subjectId: SUBJECT_IDS.reading,
  domainId: "domain_reading_comprehension",
  skillId,
  activityType,
  prompt,
  answerFormat: "multiple_choice",
  correctAnswer,
  explanation,
  hintSequence,
  difficulty,
  metadata
});

const vocabularyBase = (
  activityType: VocabularyActivityType,
  skillId: string,
  prompt: string,
  correctAnswer: string,
  explanation: string,
  hintSequence: string[],
  difficulty: number,
  metadata: Record<string, unknown>
): GeneratedActivity => ({
  subjectId: SUBJECT_IDS.vocabulary,
  domainId: "domain_word_meaning",
  skillId,
  activityType,
  prompt,
  answerFormat: "multiple_choice",
  correctAnswer,
  explanation,
  hintSequence,
  difficulty,
  metadata
});

export const readingGenerators: Record<ReadingActivityType, ActivityGenerator> = {
  reading_main_idea_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.mainIdea, "The passage explains why tools are hard to find.", "The passage is mostly about lunch plans.", "The passage lists every part of a clock."];
    const correctAnswer = choice(item.mainIdea, options);
    return {
      ...readingBase("reading_main_idea_multiple_choice", "skill_main_idea", `${item.passage}\n\nWhat is the main idea?`, correctAnswer, "The whole passage shows how preparation made the work easier.", ["Ask what the whole passage is mostly about.", "Look for the idea that connects the beginning and ending.", "The best answer includes planning and the result."], difficulty, { title: item.title }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_sequence_events: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.firstEvent, "Everyone ate lunch.", "The final result happened.", "The plants needed more light."];
    const correctAnswer = choice(item.firstEvent, options);
    return {
      ...readingBase("reading_sequence_events", "skill_sequence_events", `${item.passage}\n\nWhat happened first?`, correctAnswer, "The first event appears at the start of the passage.", ["Reread the first sentence.", "Find the action that happened before the result.", "The first event is the preparation step."], difficulty, { title: item.title }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_inference_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.inference, "The character dislikes helping.", "The character refuses to plan.", "The character wants the project to fail."];
    const correctAnswer = choice(item.inference, options);
    return {
      ...readingBase("reading_inference_multiple_choice", "skill_reading_inference", `${item.passage}\n\nWhat can you infer about the character?`, correctAnswer, "The character's actions show a careful, helpful habit.", ["An inference uses clues from the text.", "Look at what the character does before others benefit.", "Choose the answer supported by the actions."], difficulty, { title: item.title }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  }
};

export const vocabularyGenerators: Record<VocabularyActivityType, ActivityGenerator> = {
  vocabulary_context_clue_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.meaning, "noisy", "hidden", "late"];
    const correctAnswer = choice(item.meaning, options);
    return {
      ...vocabularyBase("vocabulary_context_clue_multiple_choice", "skill_context_clues", `${item.sentence}\n\nWhat does "${item.word}" mean?`, correctAnswer, "The nearby words give clues to the meaning.", ["Read around the word.", "Use the result in the sentence as a clue.", `"${item.word}" means ${item.meaning}.`], difficulty, { word: item.word }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_synonym_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.synonym, "empty", "careless", "distant"];
    const correctAnswer = choice(item.synonym, options);
    return {
      ...vocabularyBase("vocabulary_synonym_multiple_choice", "skill_synonyms", `Choose the best synonym for "${item.word}".`, correctAnswer, `A synonym has nearly the same meaning as "${item.word}".`, ["A synonym means almost the same thing.", `Think about "${item.word}" in this sentence: ${item.sentence}`, `The closest meaning is "${item.synonym}".`], difficulty, { word: item.word }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_word_usage_text: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    return {
      ...vocabularyBase("vocabulary_word_usage_text", "skill_word_usage", `Type the word that best completes the sentence: The ___ ladder did not wobble.`, item.usageAnswer, `"${item.usageAnswer}" fits because it describes something dependable.`, ["Use a word that describes something reliable.", "The sentence says the ladder did not wobble.", `The word is "${item.usageAnswer}".`], difficulty, { word: item.word }),
      answerFormat: "text"
    };
  }
};

const mathGenerators = MATH_ACTIVITY_TYPES.reduce(
  (registry, activityType) => {
    registry[activityType] = (input?: ActivityGeneratorInput) => generateProblem(activityType, input);
    return registry;
  },
  {} as Record<ProblemType, ActivityGenerator>
);

export const activityGeneratorRegistry: Record<ActivityType, ActivityGenerator> = {
  ...mathGenerators,
  ...readingGenerators,
  ...vocabularyGenerators
};

export function generateActivity(activityType: ActivityType, input?: ActivityGeneratorInput): GeneratedActivity {
  return activityGeneratorRegistry[activityType](input);
}

export const mvpActivityTypes = [
  ...MATH_ACTIVITY_TYPES,
  ...READING_ACTIVITY_TYPES,
  ...VOCABULARY_ACTIVITY_TYPES
] as ActivityType[];
