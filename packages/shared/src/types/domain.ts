export type UserRole = "parent" | "child" | "admin";
export type Theme = "forge" | "fantasy" | "scifi" | "sports";
export type TutorTone = "coach" | "rival" | "robot" | "guide";
export type ActivityTypeKind =
  | "multiple_choice"
  | "numeric_input"
  | "short_text"
  | "fill_blank"
  | "matching"
  | "ordering"
  | "classification"
  | "passage_question"
  | "rewrite"
  | "reflection";
export type AnswerFormat = "multiple_choice" | "numeric" | "text" | "short_text" | "long_text" | "ordered_list" | "matching_pairs" | "classification_groups";
export type AvatarKey = "ember_smith" | "rune_ranger" | "star_mage" | "gear_knight";
export type LearningContentStatus = "active" | "inactive";
export type ValidationMode = "deterministic" | "ai_rubric" | "hybrid";

export type Subject = {
  id: string;
  name: string;
  slug: string;
  roomName: string;
  description: string;
  status: LearningContentStatus;
  isActive: boolean;
  displayOrder: number;
};

export type ChildProfile = {
  id: string;
  parentUserId?: string;
  displayName: string;
  gradeLevel: number;
  age?: number;
  interests: string[];
  avatarKey: AvatarKey;
  preferredTheme: Theme;
  tutorTone: TutorTone;
  dailyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type StudentProfile = ChildProfile;

export type SkillDomain = {
  id: string;
  subjectId: string;
  name: string;
  slug: string;
  description: string;
  status: LearningContentStatus;
  displayOrder: number;
};

export type Domain = SkillDomain;

export type Skill = {
  id: string;
  subjectId: string;
  domainId: string;
  name: string;
  slug: string;
  description: string;
  gradeBand: string;
  status: LearningContentStatus;
  displayOrder: number;
};

export type ChildSkillProgress = {
  id: string;
  childProfileId: string;
  skillId: string;
  level: number;
  xp: number;
  masteryScore: number;
  attempts: number;
  correct: number;
  streakCorrect: number;
  streakIncorrect: number;
  currentDifficulty: number;
  lastPracticedAt?: string;
};

export type Quest = {
  id: string;
  childProfileId: string;
  questType: "daily" | "skill" | "boss" | "review";
  title: string;
  flavorText?: string;
  presentation?: QuestPresentation;
  focusSkillId: string;
  status: "not_started" | "in_progress" | "completed" | "abandoned";
  startedAt?: string;
  completedAt?: string;
  totalProblems: number;
  correctProblems: number;
  xpEarned: number;
  coinsEarned: number;
};

export type QuestPresentation = {
  title: string;
  flavor: string;
  gradeLevel: number;
  theme: Theme;
  tutorTone: TutorTone;
  focusSkillId: string;
  interestMotif?: string;
  worldName?: string;
  environment?: string;
  backdrop?: string;
};

export type ActivityTemplate = {
  id: string;
  subjectId: string;
  domainId: string;
  skillId: string;
  activityType: ActivityType;
  key?: string;
  title: string;
  description: string;
  answerFormat: AnswerFormat;
  difficultyMin: number;
  difficultyMax: number;
  generatorKey?: string;
  validatorKey?: string;
  aiAssistAllowed: boolean;
  status: LearningContentStatus;
  isActive: boolean;
};

export type ActivityStimulus = {
  type: "text" | "passage" | "image" | "table" | "diagram" | "audio_placeholder";
  title?: string;
  content: string;
  metadata?: Record<string, unknown>;
};

export type ActivityChoice = {
  id: string;
  text: string;
};

export type ActivityRubric = {
  criteria: Array<{
    key: string;
    description: string;
    maxPoints: number;
  }>;
  totalPoints: number;
  studentFriendlyDescription: string;
};

export type GeneratedActivity = {
  subjectId: string;
  domainId: string;
  skillId: string;
  activityType: ActivityType;
  prompt: string;
  stimulus?: ActivityStimulus;
  answerFormat: AnswerFormat;
  choices?: ActivityChoice[];
  correctAnswer: string;
  validationMode?: ValidationMode;
  rubric?: ActivityRubric;
  explanation: string;
  hintSequence: string[];
  difficulty: number;
  metadata: Record<string, unknown>;
};

export type GeneratedProblem = GeneratedActivity & {
  problemType: ProblemType;
};

export type ProblemType =
  | "equivalent_fraction_multiple_choice"
  | "simplify_fraction"
  | "compare_fractions"
  | "add_fractions_common_denominator"
  | "add_fractions_unlike_denominator"
  | "compare_decimals"
  | "add_decimals"
  | "subtract_decimals"
  | "decimal_place_value"
  | "equivalent_ratios"
  | "unit_rate_simple"
  | "scale_ratio"
  | "compare_integers"
  | "add_integers"
  | "subtract_integers"
  | "evaluate_expression"
  | "solve_one_step_equation_addition"
  | "solve_one_step_equation_multiplication"
  | "rectangle_area"
  | "rectangle_perimeter"
  | "rectangular_prism_volume";

export type ReadingActivityType =
  | "reading_main_idea_multiple_choice"
  | "reading_supporting_detail_multiple_choice"
  | "reading_sequence_events"
  | "reading_inference_multiple_choice"
  | "reading_context_clue_multiple_choice";

export type VocabularyActivityType =
  | "vocabulary_definition_match"
  | "vocabulary_context_clue_multiple_choice"
  | "vocabulary_context_sentence_choice"
  | "vocabulary_synonym_multiple_choice"
  | "vocabulary_antonym_choice"
  | "vocabulary_prefix_meaning_choice"
  | "vocabulary_word_usage_text";

export type ActivityType = ProblemType | ReadingActivityType | VocabularyActivityType;

export type ProblemAttempt = GeneratedProblem & {
  id: string;
  questId: string;
  childProfileId: string;
  submittedAnswer?: string;
  isCorrect?: boolean;
  hintsUsed: number;
  timeSpentSeconds?: number;
  createdAt: string;
  answeredAt?: string;
};

export type RewardInventory = {
  id: string;
  childProfileId: string;
  coins: number;
  xp: number;
  level: number;
  unlockedItems: string[];
  equippedItems: string[];
};

export type ForgeUpgrade = {
  id: string;
  childProfileId: string;
  upgradeKey: string;
  upgradeName: string;
  level: number;
  purchasedAt: string;
};
