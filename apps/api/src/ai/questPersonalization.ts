import { worldForTheme, type ChildProfile, type QuestPresentation, type Skill, type Theme } from "@learningforge/shared";

export type QuestPersonalizationInput = {
  child: Pick<ChildProfile, "gradeLevel" | "interests" | "preferredTheme" | "tutorTone">;
  focusSkill: Pick<Skill, "id" | "name" | "slug">;
  questLength: number;
};

export const QUEST_PERSONALIZATION_AGENT_MODEL = "gpt-5.4-mini";

export const questPersonalizationSystemPrompt = `
You are the LearningForge Quest Personalization Agent.
Create a short quest title and flavor text from grade, interests, theme, tutor tone, and focus skill.
Rules:
- Do not generate math answers.
- Do not change problem correctness or difficulty rules.
- Keep child-facing text short, encouraging, non-shaming, and age-appropriate.
- No open-ended chat.
- Return JSON only: { "title": string, "flavor": string }.
`;

export async function personalizeQuest(input: QuestPersonalizationInput): Promise<QuestPresentation> {
  // Runtime gpt-5.4-mini integration belongs here. Sprint 1 keeps deterministic fallback for AI-offline mode.
  return fallbackQuestPersonalization(input);
}

export function fallbackQuestPersonalization(input: QuestPersonalizationInput): QuestPresentation {
  const interests = input.child.interests.map((interest) => interest.toLowerCase());
  const theme = inferTheme(input.child.preferredTheme, interests);
  const interestMotif = interests[0];
  const gradeBand = input.child.gradeLevel <= 4 ? "elementary" : input.child.gradeLevel <= 6 ? "middle" : "advanced";
  const skillLabel = input.focusSkill.name.replace("Adding ", "").replace(" with ", " ");
  const world = worldForTheme(theme);

  if (theme === "sports") {
    return {
      title: gradeBand === "elementary" ? "Train the Number League" : `Run the ${skillLabel} Playbook`,
      flavor: "Warm up, read the field, and turn each answer into yards gained.",
      gradeLevel: input.child.gradeLevel,
      theme,
      tutorTone: input.child.tutorTone,
      focusSkillId: input.focusSkill.id,
      interestMotif,
      worldName: world.worldName,
      environment: world.environment,
      backdrop: world.backdrop
    };
  }

  if (theme === "scifi") {
    return {
      title: gradeBand === "elementary" ? "Power the Number Core" : `Stabilize the ${skillLabel} Reactor`,
      flavor: "The station needs clean calculations before the core goes fully online.",
      gradeLevel: input.child.gradeLevel,
      theme,
      tutorTone: input.child.tutorTone,
      focusSkillId: input.focusSkill.id,
      interestMotif,
      worldName: world.worldName,
      environment: world.environment,
      backdrop: world.backdrop
    };
  }

  if (theme === "fantasy") {
    return {
      title: gradeBand === "elementary" ? "Wake the Number Grove" : `Reforge the ${skillLabel} Gate`,
      flavor: "Every solved problem adds power back to the old gate.",
      gradeLevel: input.child.gradeLevel,
      theme,
      tutorTone: input.child.tutorTone,
      focusSkillId: input.focusSkill.id,
      interestMotif,
      worldName: world.worldName,
      environment: world.environment,
      backdrop: world.backdrop
    };
  }

  return {
    title: gradeBand === "elementary" ? "Spark the LearningForge" : `Reignite the ${skillLabel} Furnace`,
    flavor: "The forge responds to steady work. Solve the set and bring the next room online.",
    gradeLevel: input.child.gradeLevel,
    theme,
    tutorTone: input.child.tutorTone,
    focusSkillId: input.focusSkill.id,
    interestMotif,
    worldName: world.worldName,
    environment: world.environment,
    backdrop: world.backdrop
  };
}

function inferTheme(preferredTheme: Theme, interests: string[]): Theme {
  if (preferredTheme !== "forge") return preferredTheme;
  if (interests.some((interest) => ["soccer", "basketball", "baseball", "football", "sports"].includes(interest))) return "sports";
  if (interests.some((interest) => ["space", "robots", "robotics", "minecraft", "coding", "games"].includes(interest))) return "scifi";
  if (interests.some((interest) => ["dragons", "fantasy", "magic", "wizards"].includes(interest))) return "fantasy";
  return "forge";
}
