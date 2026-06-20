export type UserRole = "parent" | "child";
export type Theme = "forge" | "fantasy" | "scifi" | "sports";
export type TutorTone = "coach" | "rival" | "robot" | "guide";
export type AnswerFormat = "multiple_choice" | "numeric" | "text";
export type AvatarKey = "ember_smith" | "rune_ranger" | "star_mage" | "gear_knight";

export type ChildProfile = {
  id: string;
  parentUserId?: string;
  displayName: string;
  gradeLevel: number;
  interests: string[];
  avatarKey: AvatarKey;
  preferredTheme: Theme;
  tutorTone: TutorTone;
  dailyGoalMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type SkillDomain = {
  id: string;
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export type Skill = {
  id: string;
  domainId: string;
  name: string;
  slug: string;
  description: string;
  gradeBand: string;
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

export type GeneratedProblem = {
  skillId: string;
  problemType: ProblemType;
  prompt: string;
  answerFormat: AnswerFormat;
  choices?: Array<{ id: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  hintSequence: string[];
  difficulty: number;
  metadata: Record<string, unknown>;
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
