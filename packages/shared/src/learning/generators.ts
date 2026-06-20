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
    supportingDetail: "The benches were clear and the plans were easy to follow.",
    firstEvent: "Maya sorted the tools.",
    secondEvent: "The team arrived.",
    thirdEvent: "The broken clock was ticking again.",
    inference: "Maya is organized and helpful.",
    contextWord: "clear",
    contextMeaning: "not cluttered"
  },
  {
    title: "The Garden Map",
    passage: "Leo drew a map before planting. He marked sunny spots for tomatoes and shady corners for herbs. A month later, every plant had the light it needed.",
    mainIdea: "Leo used planning to help the garden grow well.",
    supportingDetail: "He marked sunny spots for tomatoes and shady corners for herbs.",
    firstEvent: "Leo drew a map.",
    secondEvent: "He marked sunny spots and shady corners.",
    thirdEvent: "Every plant had the light it needed.",
    inference: "Leo thinks carefully before starting work.",
    contextWord: "marked",
    contextMeaning: "labeled or showed"
  }
];

const vocabularyItems = [
  {
    word: "sturdy",
    sentence: "The sturdy shelf held every heavy book without bending.",
    meaning: "strong",
    synonym: "solid",
    antonym: "weak",
    prefixWord: "rebuild",
    prefixMeaning: "build again",
    usageAnswer: "sturdy"
  },
  {
    word: "brief",
    sentence: "The teacher gave a brief reminder before the quiz began.",
    meaning: "short",
    synonym: "quick",
    antonym: "long",
    prefixWord: "preview",
    prefixMeaning: "see before",
    usageAnswer: "brief"
  }
];

const select = <T>(items: T[], seed = 0): T => items[Math.abs(seed) % items.length];

const readingBase = (
  activityType: ReadingActivityType,
  domainId: string,
  skillId: string,
  prompt: string,
  correctAnswer: string,
  explanation: string,
  hintSequence: string[],
  difficulty: number,
  metadata: Record<string, unknown>,
  answerFormat: GeneratedActivity["answerFormat"] = "multiple_choice"
): GeneratedActivity => ({
  subjectId: SUBJECT_IDS.reading,
  domainId,
  skillId,
  activityType,
  prompt,
  answerFormat,
  correctAnswer,
  validationMode: "deterministic",
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
  validationMode: "deterministic",
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
      ...readingBase("reading_main_idea_multiple_choice", "domain_reading_comprehension", "skill_main_idea", "What is the main idea of this passage?", correctAnswer, "The whole passage points to one bigger idea, not just one small detail.", ["Ask what the whole passage is mostly about.", "Look for the idea that connects the beginning and ending.", "The best answer includes the main action and result."], difficulty, { title: item.title }),
      stimulus: { type: "passage", title: item.title, content: item.passage },
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_supporting_detail_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.supportingDetail, "The passage says the character wanted to stop.", "The passage explains a completely different project.", "The passage says nobody helped."];
    const correctAnswer = choice(item.supportingDetail, options);
    return {
      ...readingBase("reading_supporting_detail_multiple_choice", "domain_reading_comprehension", "skill_supporting_detail", "Which detail best supports the main idea?", correctAnswer, "A supporting detail gives evidence for the big idea.", ["Find the detail that proves the main idea.", "Ignore choices that are not in the passage.", "The useful detail shows how planning helped."], difficulty, { title: item.title }),
      stimulus: { type: "passage", title: item.title, content: item.passage },
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_sequence_events: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.thirdEvent, item.firstEvent, item.secondEvent];
    const correctAnswer = "B,C,A";
    return {
      ...readingBase("reading_sequence_events", "domain_reading_comprehension", "skill_sequence_events", "Put these events in the order they happened. Use the letters, like A,B,C.", correctAnswer, "The passage moves from planning to setup to the final result.", ["Reread the first sentence.", "Find the action that happened before the result.", "Start with the preparation step, then the setup, then the result."], difficulty, { title: item.title }, "ordered_list"),
      stimulus: { type: "passage", title: item.title, content: item.passage },
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_inference_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.inference, "The character dislikes helping.", "The character refuses to plan.", "The character wants the project to fail."];
    const correctAnswer = choice(item.inference, options);
    return {
      ...readingBase("reading_inference_multiple_choice", "domain_reading_inference", "skill_reading_inference", "What can you infer about the character?", correctAnswer, "The character's actions show a careful, helpful habit.", ["An inference uses clues from the text.", "Look at what the character does before others benefit.", "Choose the answer supported by the actions."], difficulty, { title: item.title }),
      stimulus: { type: "passage", title: item.title, content: item.passage },
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  reading_context_clue_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(readingPassages, seed);
    const options = [item.contextMeaning, "broken", "dangerous", "late"];
    const correctAnswer = choice(item.contextMeaning, options);
    return {
      ...readingBase("reading_context_clue_multiple_choice", "domain_reading_vocabulary_context", "skill_reading_context_clues", `In the passage, what does "${item.contextWord}" most likely mean?`, correctAnswer, "Nearby words in the passage point to the word's meaning.", ["Look at the words around the target word.", "Ask which meaning fits the sentence.", "Pick the meaning that keeps the sentence true."], difficulty, { title: item.title, word: item.contextWord }),
      stimulus: { type: "passage", title: item.title, content: item.passage },
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  }
};

export const vocabularyGenerators: Record<VocabularyActivityType, ActivityGenerator> = {
  vocabulary_definition_match: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.meaning, "a tool for measuring", "a type of weather", "a hidden path"];
    const correctAnswer = choice(item.meaning, options);
    return {
      ...vocabularyBase("vocabulary_definition_match", "skill_definition_match", `What is the best meaning of "${item.word}"?`, correctAnswer, `"${item.word}" means ${item.meaning}.`, ["Think about the word's everyday meaning.", `Use it in this sentence: ${item.sentence}`, `The closest meaning is "${item.meaning}".`], difficulty, { word: item.word }),
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_context_clue_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.meaning, "noisy", "hidden", "late"];
    const correctAnswer = choice(item.meaning, options);
    return {
      ...vocabularyBase("vocabulary_context_clue_multiple_choice", "skill_context_sentence_choice", `${item.sentence}\n\nWhat does "${item.word}" mean?`, correctAnswer, "The nearby words give clues to the meaning.", ["Read around the word.", "Use the result in the sentence as a clue.", `"${item.word}" means ${item.meaning}.`], difficulty, { word: item.word }),
      domainId: "domain_vocabulary_context_clues",
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_context_sentence_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.word, "shaky", "enormous", "silent"];
    const correctAnswer = choice(item.word, options);
    return {
      ...vocabularyBase("vocabulary_context_sentence_choice", "skill_context_sentence_choice", `Choose the word that best completes the sentence: ${item.sentence.replace(item.word, "___")}`, correctAnswer, "The sentence clues point to the word that makes the meaning fit.", ["Read the whole sentence before choosing.", "Look for clues after the blank.", `The word that fits is "${item.word}".`], difficulty, { word: item.word }),
      domainId: "domain_vocabulary_context_clues",
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_synonym_multiple_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.synonym, "empty", "careless", "distant"];
    const correctAnswer = choice(item.synonym, options);
    return {
      ...vocabularyBase("vocabulary_synonym_multiple_choice", "skill_synonyms", `Choose the best synonym for "${item.word}".`, correctAnswer, `A synonym has nearly the same meaning as "${item.word}".`, ["A synonym means almost the same thing.", `Think about "${item.word}" in this sentence: ${item.sentence}`, `The closest meaning is "${item.synonym}".`], difficulty, { word: item.word }),
      domainId: "domain_synonyms_antonyms",
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_antonym_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const options = [item.antonym, item.synonym, item.meaning, item.word];
    const correctAnswer = choice(item.antonym, options);
    return {
      ...vocabularyBase("vocabulary_antonym_choice", "skill_antonyms", `Choose the best antonym for "${item.word}".`, correctAnswer, `An antonym means the opposite of "${item.word}".`, ["An antonym means the opposite.", `Think about "${item.word}" in this sentence: ${item.sentence}`, `The opposite meaning is "${item.antonym}".`], difficulty, { word: item.word }),
      domainId: "domain_synonyms_antonyms",
      choices: options.map((text, i) => ({ id: String.fromCharCode(65 + i), text }))
    };
  },
  vocabulary_prefix_meaning_choice: ({ difficulty = 1, seed = 0 } = {}) => {
    const item = select(vocabularyItems, seed);
    const prefix = item.prefixWord.startsWith("re") ? "re-" : "pre-";
    const options = [item.prefixMeaning, "not able to", "full of", "without"];
    const correctAnswer = choice(item.prefixMeaning, options);
    return {
      ...vocabularyBase("vocabulary_prefix_meaning_choice", "skill_prefix_meaning", `What does "${item.prefixWord}" mean?`, correctAnswer, `The prefix ${prefix} helps show the meaning of "${item.prefixWord}".`, ["Look at the prefix at the start of the word.", "Prefixes change or sharpen a word's meaning.", `${prefix} helps make the meaning "${item.prefixMeaning}".`], difficulty, { word: item.prefixWord, prefix }),
      domainId: "domain_prefixes_suffixes",
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
