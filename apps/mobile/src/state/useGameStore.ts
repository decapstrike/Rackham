import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  SUBJECT_IDS,
  activityTemplates,
  answerReward,
  avatarOptions,
  buildDailyQuestPlan,
  checkAnswer,
  generateActivity,
  levelFromXp,
  rewardRules,
  skills,
  validateActivityAnswer,
  worldForTheme,
  type ActivityType,
  type AvatarKey,
  type ChildProfile,
  type GeneratedActivity,
  type ProblemAttempt,
  type Quest
} from "@learningforge/shared";
import type { DisplayActivity } from "../content/learningContent";

type Feedback = { message: string; isCorrect: boolean } | null;
type LocalQuestMode = "mixed" | "math" | "reading" | "vocabulary";
type LocalQuestAttempt = GeneratedActivity & {
  id: string;
  questId: string;
  childProfileId: string;
  submittedAnswer?: string;
  isCorrect?: boolean;
  hintsUsed: number;
  timeSpentSeconds?: number;
  createdAt: string;
  answeredAt?: string;
  problemType?: ProblemAttempt["problemType"];
};

type LocalQuestPlanItem = {
  activityType: ActivityType;
  difficulty: number;
  role: "focus" | "review" | "challenge";
};

type GameState = {
  child?: ChildProfile;
  quest?: Quest;
  selectedActivity?: DisplayActivity;
  attempts: LocalQuestAttempt[];
  currentIndex: number;
  feedback: Feedback;
  xp: number;
  coins: number;
  forge: Record<string, number>;
  completedQuestCount: number;
  totalProblemsAnswered: number;
  totalCorrectAnswers: number;
  lastCompletedAt?: string;
  createProfile: (input: Pick<ChildProfile, "displayName" | "gradeLevel" | "preferredTheme" | "tutorTone" | "dailyGoalMinutes"> & { interests?: string[]; avatarKey?: AvatarKey }) => void;
  startQuest: (mode?: LocalQuestMode) => void;
  selectActivity: (activity: DisplayActivity) => void;
  clearSelectedActivity: () => void;
  submitAnswer: (answer: string) => void;
  requestHint: () => string | undefined;
  continueQuest: () => void;
  buyUpgrade: (key: string, cost: number) => void;
  resetPrototype: () => void;
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      attempts: [],
      currentIndex: 0,
      feedback: null,
      xp: 0,
      coins: 0,
      forge: {},
      completedQuestCount: 0,
      totalProblemsAnswered: 0,
      totalCorrectAnswers: 0,
      createProfile: (input) => {
        const timestamp = now();
        set({
          child: {
            id: id("child"),
            parentUserId: undefined,
            displayName: input.displayName,
            gradeLevel: input.gradeLevel,
            interests: input.interests ?? [],
            avatarKey: input.avatarKey ?? "ember_smith",
            preferredTheme: input.preferredTheme,
            tutorTone: input.tutorTone,
            dailyGoalMinutes: input.dailyGoalMinutes,
            createdAt: timestamp,
            updatedAt: timestamp
          }
        });
      },
      startQuest: (mode = "mixed") => {
        const child = get().child;
        if (!child) return;
        const plan = buildLocalQuestPlan(mode);
        const world = worldForTheme(child.preferredTheme);
        const title = localQuestTitle(child, mode);
        const quest: Quest = {
          id: id("quest"),
          childProfileId: child.id,
          questType: "daily",
          title,
          flavorText: `Explore ${world.worldName}: ${world.backdrop}. Eight quick activities power the next gate.`,
          focusSkillId: focusSkillIdFor(mode),
          status: "in_progress",
          startedAt: now(),
          totalProblems: plan.length,
          correctProblems: 0,
          xpEarned: 0,
          coinsEarned: 0
        };
        const attempts = plan.map((item, index) => {
          const generated = generateActivity(item.activityType, { difficulty: item.difficulty, seed: index });
          return {
            ...generated,
            id: id("attempt"),
            questId: quest.id,
            childProfileId: child.id,
            hintsUsed: 0,
            createdAt: now(),
            metadata: { ...generated.metadata, questRole: item.role, order: index + 1, rewarded: false, missedBeforeCorrect: false }
          };
        });
        set({ quest, attempts, currentIndex: 0, selectedActivity: undefined, feedback: null });
      },
      selectActivity: (activity) => set({ selectedActivity: activity, feedback: null }),
      clearSelectedActivity: () => set({ selectedActivity: undefined, feedback: null }),
      submitAnswer: (answer) => {
        const state = get();
        const attempt = state.attempts[state.currentIndex];
        if (!attempt || attempt.isCorrect === true) return;
        const isCorrect = checkLocalAnswer(attempt, answer);
        const wasIncorrectThenCorrected = attempt.isCorrect === false && isCorrect;
        const reward = answerReward({ isCorrect, hintsUsed: attempt.hintsUsed, wasIncorrectThenCorrected });
        const updatedAttempt: LocalQuestAttempt = {
          ...attempt,
          submittedAnswer: answer,
          isCorrect,
          answeredAt: now(),
          metadata: {
            ...attempt.metadata,
            missedBeforeCorrect: wasIncorrectThenCorrected || attempt.isCorrect === false,
            rewarded: isCorrect
          }
        };
        const updated = [...state.attempts];
        updated[state.currentIndex] = updatedAttempt;
        set({
          attempts: updated,
          xp: state.xp + reward.xp,
          coins: state.coins + reward.coins,
          totalProblemsAnswered: state.totalProblemsAnswered + 1,
          totalCorrectAnswers: state.totalCorrectAnswers + (isCorrect ? 1 : 0),
          feedback: {
            isCorrect,
            message: isCorrect ? `Nice. ${attempt.explanation}` : `Close. ${attempt.hintSequence[0]}`
          }
        });
      },
      requestHint: () => {
        const state = get();
        const attempt = state.attempts[state.currentIndex];
        if (!attempt || attempt.isCorrect === true) return undefined;
        const nextHintLevel = Math.min(attempt.hintSequence.length, attempt.hintsUsed + 1);
        const updated = [...state.attempts];
        updated[state.currentIndex] = { ...attempt, hintsUsed: nextHintLevel };
        const hint = attempt.hintSequence[nextHintLevel - 1];
        set({ attempts: updated, feedback: { isCorrect: false, message: hint } });
        return hint;
      },
      continueQuest: () => {
        const state = get();
        if (state.currentIndex >= state.attempts.length - 1) {
          if (state.quest?.status === "completed") return;
          const correctProblems = state.attempts.filter((attempt) => attempt.isCorrect).length;
          const perfectBonus = correctProblems === state.attempts.length ? rewardRules.perfectQuestBonusCoins : 0;
          const completionCoins = rewardRules.questCompletionCoins + perfectBonus;
          set({
            quest: state.quest ? {
              ...state.quest,
              status: "completed",
              completedAt: now(),
              correctProblems,
              xpEarned: rewardRules.questCompletionXp,
              coinsEarned: completionCoins
            } : undefined,
            xp: state.xp + rewardRules.questCompletionXp,
            coins: state.coins + completionCoins,
            completedQuestCount: state.completedQuestCount + 1,
            lastCompletedAt: now(),
            feedback: null
          });
          return;
        }
        set({ currentIndex: state.currentIndex + 1, feedback: null });
      },
      buyUpgrade: (key, cost) => {
        const state = get();
        if (state.coins < cost) return;
        set({ coins: state.coins - cost, forge: { ...state.forge, [key]: (state.forge[key] ?? 0) + 1 } });
      },
      resetPrototype: () => set({
        child: undefined,
        quest: undefined,
        selectedActivity: undefined,
        attempts: [],
        currentIndex: 0,
        feedback: null,
        xp: 0,
        coins: 0,
        forge: {},
        completedQuestCount: 0,
        totalProblemsAnswered: 0,
        totalCorrectAnswers: 0,
        lastCompletedAt: undefined
      })
    }),
    {
      name: "learningforge-prototype-state",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        child: state.child,
        quest: state.quest,
        attempts: state.attempts,
        currentIndex: state.currentIndex,
        xp: state.xp,
        coins: state.coins,
        forge: state.forge,
        completedQuestCount: state.completedQuestCount,
        totalProblemsAnswered: state.totalProblemsAnswered,
        totalCorrectAnswers: state.totalCorrectAnswers,
        lastCompletedAt: state.lastCompletedAt
      })
    }
  )
);

export function currentLevel(xp: number) {
  return levelFromXp(xp);
}

export const visibleSkills = skills.slice(0, 12);
export const visibleAvatars = avatarOptions;

function localQuestTitle(child: ChildProfile, mode: LocalQuestMode) {
  if (mode === "reading") return "Reading Preview Quest";
  if (mode === "vocabulary") return "Vocabulary Preview Quest";
  if (mode === "mixed") return "Daily LearningForge Quest";
  const world = worldForTheme(child.preferredTheme);
  if (child.preferredTheme === "scifi") return "Stabilize the Equivalent Fractions Reactor";
  if (child.preferredTheme === "fantasy") return "Reforge the Equivalent Fractions Gate";
  if (child.preferredTheme === "sports" || child.interests.some((interest) => interest.toLowerCase() === "soccer")) return "Run the Equivalent Fractions Playbook";
  return `${capitalize(world.primaryActionVerb)} the Equivalent Fractions Furnace`;
}

function buildLocalQuestPlan(mode: LocalQuestMode): LocalQuestPlanItem[] {
  if (mode === "math") {
    return buildDailyQuestPlan().map((item) => ({ activityType: item.problemType, difficulty: item.difficulty, role: item.role }));
  }

  const subjectId = mode === "reading"
    ? SUBJECT_IDS.reading
    : mode === "vocabulary"
      ? SUBJECT_IDS.vocabulary
      : undefined;
  const templates = subjectId
    ? activityTemplates.filter((template) => template.subjectId === subjectId && template.status === "active")
    : [
        templateFor("equivalent_fraction_multiple_choice"),
        templateFor("reading_main_idea_multiple_choice"),
        templateFor("vocabulary_context_clue_multiple_choice"),
        templateFor("simplify_fraction"),
        templateFor("reading_sequence_events"),
        templateFor("vocabulary_synonym_multiple_choice"),
        templateFor("compare_fractions"),
        templateFor("vocabulary_word_usage_text")
      ].filter((template) => template !== undefined);

  return Array.from({ length: 8 }, (_, index) => {
    const template = templates[index % templates.length];
    return {
      activityType: template.activityType,
      difficulty: index === 7 ? 2 : 1,
      role: index < 5 ? "focus" : index < 7 ? "review" : "challenge"
    };
  });
}

function templateFor(activityType: ActivityType) {
  return activityTemplates.find((template) => template.activityType === activityType);
}

function focusSkillIdFor(mode: LocalQuestMode) {
  if (mode === "reading") return "skill_main_idea";
  if (mode === "vocabulary") return "skill_context_sentence_choice";
  return "skill_equivalent_fractions";
}

function checkLocalAnswer(attempt: LocalQuestAttempt, submittedAnswer: string) {
  if (attempt.subjectId === SUBJECT_IDS.math && attempt.problemType) {
    return checkAnswer(attempt as ProblemAttempt, submittedAnswer);
  }
  return validateActivityAnswer(attempt, submittedAnswer).isCorrect;
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
