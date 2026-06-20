import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { answerReward, avatarOptions, buildDailyQuestPlan, checkAnswer, generateProblem, levelFromXp, rewardRules, skills, worldForTheme, type AvatarKey, type ChildProfile, type ProblemAttempt, type Quest } from "@learningforge/shared";
import type { DisplayActivity } from "../content/learningContent";

type Feedback = { message: string; isCorrect: boolean } | null;

type GameState = {
  child?: ChildProfile;
  quest?: Quest;
  selectedActivity?: DisplayActivity;
  attempts: ProblemAttempt[];
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
  startQuest: () => void;
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
      startQuest: () => {
        const child = get().child;
        if (!child) return;
        const plan = buildDailyQuestPlan();
        const world = worldForTheme(child.preferredTheme);
        const quest: Quest = {
          id: id("quest"),
          childProfileId: child.id,
          questType: "daily",
          title: localQuestTitle(child),
          flavorText: `Explore ${world.worldName}: ${world.backdrop}. Eight quick activities power the next gate.`,
          focusSkillId: "skill_equivalent_fractions",
          status: "in_progress",
          startedAt: now(),
          totalProblems: 8,
          correctProblems: 0,
          xpEarned: 0,
          coinsEarned: 0
        };
        const attempts = plan.map((item, index) => {
          const generated = generateProblem(item.problemType, { difficulty: item.difficulty, seed: index });
          return {
            ...generated,
            subjectId: "math",
            domainId: "math-fractions",
            activityType: generated.problemType,
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
        const isCorrect = checkAnswer(attempt, answer);
        const wasIncorrectThenCorrected = attempt.isCorrect === false && isCorrect;
        const reward = answerReward({ isCorrect, hintsUsed: attempt.hintsUsed, wasIncorrectThenCorrected });
        const updatedAttempt: ProblemAttempt = {
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
          totalProblemsAnswered: state.totalProblemsAnswered + (isCorrect ? 1 : 0),
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
        const updated = [...state.attempts];
        updated[state.currentIndex] = { ...attempt, hintsUsed: Math.max(1, attempt.hintsUsed) };
        set({ attempts: updated, feedback: { isCorrect: false, message: attempt.hintSequence[0] } });
        return attempt.hintSequence[0];
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

function localQuestTitle(child: ChildProfile) {
  const world = worldForTheme(child.preferredTheme);
  if (child.preferredTheme === "scifi") return "Stabilize the Equivalent Fractions Reactor";
  if (child.preferredTheme === "fantasy") return "Reforge the Equivalent Fractions Gate";
  if (child.preferredTheme === "sports" || child.interests.some((interest) => interest.toLowerCase() === "soccer")) return "Run the Equivalent Fractions Playbook";
  return `${capitalize(world.primaryActionVerb)} the Equivalent Fractions Furnace`;
}

function capitalize(value: string) {
  return value.slice(0, 1).toUpperCase() + value.slice(1);
}
