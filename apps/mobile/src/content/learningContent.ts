import { SUBJECT_IDS, activityTemplates, type AnswerFormat } from "@learningforge/shared";

export type LearningSubjectId = "math" | "reading" | "vocabulary";

export type LearningSubject = {
  id: LearningSubjectId;
  name: string;
  description: string;
  rooms: LearningRoom[];
};

export type LearningRoom = {
  id: string;
  subjectId: LearningSubjectId;
  name: string;
  description: string;
  status: "ready" | "preview" | "locked";
  activityIds: string[];
};

export type DisplayActivity = {
  id: string;
  subjectId: LearningSubjectId;
  domainId: string;
  skillId: string;
  activityType: string;
  title: string;
  prompt: string;
  answerFormat: AnswerFormat;
  choices?: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  hintSequence: string[];
  difficulty: number;
  metadata: Record<string, unknown>;
};

export const learningSubjects: LearningSubject[] = [
  {
    id: "math",
    name: "Math",
    description: "Numbers, fractions, geometry, and problem solving.",
    rooms: [
      {
        id: "math-fractions",
        subjectId: "math",
        name: "Fraction Forge",
        description: "The current daily quest lives here.",
        status: "ready",
        activityIds: ["math-fraction-preview"]
      },
      {
        id: "math-decimals",
        subjectId: "math",
        name: "Decimal Dock",
        description: "Place value and decimal comparisons.",
        status: "locked",
        activityIds: []
      }
    ]
  },
  {
    id: "reading",
    name: "Reading",
    description: "Main idea, sequence, and inference practice.",
    rooms: [
      {
        id: "reading-comprehension",
        subjectId: "reading",
        name: "Story Signals",
        description: "Read short passages and choose what matters most.",
        status: "preview",
        activityIds: ["reading-main-idea-preview"]
      }
    ]
  },
  {
    id: "vocabulary",
    name: "Vocabulary",
    description: "Word meaning, synonyms, and usage in context.",
    rooms: [
      {
        id: "vocabulary-context",
        subjectId: "vocabulary",
        name: "Word Workshop",
        description: "Use clues around a word to figure out meaning.",
        status: "preview",
        activityIds: ["vocabulary-context-preview"]
      }
    ]
  }
];

export const displayActivities: DisplayActivity[] = [
  {
    id: "math-fraction-preview",
    subjectId: "math",
    domainId: "math-fractions",
    skillId: "skill_equivalent_fractions",
    activityType: "equivalent_fraction_multiple_choice",
    title: "Equivalent Fractions",
    prompt: "Which fraction is equivalent to 2/3?",
    answerFormat: "multiple_choice",
    choices: [
      { id: "A", text: "2/6" },
      { id: "B", text: "4/6" },
      { id: "C", text: "3/4" },
      { id: "D", text: "5/6" }
    ],
    correctAnswer: "B",
    explanation: "4/6 matches 2/3 because both parts were doubled.",
    hintSequence: ["Equivalent fractions keep the same value.", "Try multiplying the top and bottom by 2.", "2/3 doubled gives 4/6."],
    difficulty: 1,
    metadata: { questRole: "practice" }
  },
  {
    id: "reading-main-idea-preview",
    subjectId: "reading",
    domainId: "reading-comprehension",
    skillId: "skill_reading_main_idea",
    activityType: "reading_main_idea_multiple_choice",
    title: "Main Idea",
    prompt: "Maya packed water, a map, and a flashlight before the hike. The clouds were dark, so she also took a raincoat. What is the main idea?",
    answerFormat: "multiple_choice",
    choices: [
      { id: "A", text: "Maya prepared for a hike." },
      { id: "B", text: "Maya forgot her map." },
      { id: "C", text: "The flashlight was broken." },
      { id: "D", text: "The hike was canceled." }
    ],
    correctAnswer: "A",
    explanation: "The details all show Maya getting ready for the hike.",
    hintSequence: ["Look for the answer that all details support.", "The items she packed are clues.", "The best answer is about Maya preparing."],
    difficulty: 1,
    metadata: { questRole: "preview" }
  },
  {
    id: "vocabulary-context-preview",
    subjectId: "vocabulary",
    domainId: "vocabulary-context",
    skillId: "skill_vocabulary_context_clues",
    activityType: "vocabulary_context_clue_multiple_choice",
    title: "Context Clues",
    prompt: "The trail was steep, so Leo moved at a gradual pace instead of rushing. What does gradual mean?",
    answerFormat: "multiple_choice",
    choices: [
      { id: "A", text: "Careless" },
      { id: "B", text: "Slow and steady" },
      { id: "C", text: "Very loud" },
      { id: "D", text: "Hidden" }
    ],
    correctAnswer: "B",
    explanation: "Gradual means moving or changing slowly and steadily.",
    hintSequence: ["Use the contrast with rushing.", "Steep trails are easier when you move slowly.", "Gradual means slow and steady."],
    difficulty: 1,
    metadata: { questRole: "preview" }
  }
];

export function subjectNameFor(id?: string) {
  if (id === SUBJECT_IDS.math) return "Math";
  if (id === SUBJECT_IDS.reading) return "Reading";
  if (id === SUBJECT_IDS.vocabulary) return "Vocabulary";
  return learningSubjects.find((subject) => subject.id === id)?.name ?? "Math";
}

export function activityTitle(activityType?: string) {
  if (!activityType) return "Activity";
  const template = activityTemplates.find((item) => item.activityType === activityType);
  if (template) return template.title;
  return activityType
    .split("_")
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}
