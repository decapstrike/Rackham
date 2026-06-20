import { create } from "zustand";
import { avatarOptions, buildDailyQuestPlan, checkAnswer, generateProblem, levelFromXp, rewardRules, skills, worldForTheme, type AvatarKey, type ChildProfile, type ProblemAttempt, type Quest } from "@mathforge/shared";

type Feedback = { message: string; isCorrect: boolean } | null;

type GameState = {
  child?: ChildProfile;
  quest?: Quest;
  attempts: ProblemAttempt[];
  currentIndex: number;
  feedback: Feedback;
  xp: number;
  coins: number;
  forge: Record<string, number>;
  createProfile: (input: Pick<ChildProfile, "displayName" | "gradeLevel" | "preferredTheme" | "tutorTone" | "dailyGoalMinutes"> & { interests?: string[]; avatarKey?: AvatarKey }) => void;
  startQuest: () => void;
  submitAnswer: (answer: string) => void;
  requestHint: () => string | undefined;
  continueQuest: () => void;
  buyUpgrade: (key: string, cost: number) => void;
};

const now = () => new Date().toISOString();
const id = (prefix: string) => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const useGameStore = create<GameState>((set, get) => ({
  attempts: [],
  currentIndex: 0,
  feedback: null,
  xp: 0,
  coins: 0,
  forge: {},
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
    const quest: Quest = {
      id: id("quest"),
      childProfileId: child.id,
      questType: "daily",
      title: localQuestTitle(child),
      flavorText: `Explore ${worldForTheme(child.preferredTheme).worldName}. Eight fast problems power the next gate.`,
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
        id: id("attempt"),
        questId: quest.id,
        childProfileId: child.id,
        hintsUsed: 0,
        createdAt: now(),
        metadata: { ...generated.metadata, questRole: item.role, order: index + 1 }
      };
    });
    set({ quest, attempts, currentIndex: 0, feedback: null });
  },
  submitAnswer: (answer) => {
    const state = get();
    const attempt = state.attempts[state.currentIndex];
    if (!attempt) return;
    const isCorrect = checkAnswer(attempt, answer);
    const updated = [...state.attempts];
    updated[state.currentIndex] = { ...attempt, submittedAnswer: answer, isCorrect, answeredAt: now() };
    const xp = isCorrect ? (attempt.hintsUsed > 0 ? rewardRules.correctWithHintXp : rewardRules.correctXp) : 0;
    const coins = isCorrect ? (attempt.hintsUsed > 0 ? rewardRules.correctWithHintCoins : rewardRules.correctCoins) : 0;
    set({
      attempts: updated,
      xp: state.xp + xp,
      coins: state.coins + coins,
      feedback: {
        isCorrect,
        message: isCorrect ? `Nice. ${attempt.explanation}` : `Close. ${attempt.hintSequence[0]}`
      }
    });
  },
  requestHint: () => {
    const state = get();
    const attempt = state.attempts[state.currentIndex];
    if (!attempt) return undefined;
    const updated = [...state.attempts];
    updated[state.currentIndex] = { ...attempt, hintsUsed: Math.max(1, attempt.hintsUsed) };
    set({ attempts: updated, feedback: { isCorrect: false, message: attempt.hintSequence[0] } });
    return attempt.hintSequence[0];
  },
  continueQuest: () => {
    const state = get();
    if (state.currentIndex >= state.attempts.length - 1) {
      set({
        quest: state.quest ? { ...state.quest, status: "completed", completedAt: now(), xpEarned: state.xp + rewardRules.questCompletionXp, coinsEarned: state.coins + rewardRules.questCompletionCoins } : undefined,
        xp: state.xp + rewardRules.questCompletionXp,
        coins: state.coins + rewardRules.questCompletionCoins,
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
  }
}));

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
