import type { AvatarKey, Theme } from "../types/domain.js";

export type AvatarOption = {
  key: AvatarKey;
  name: string;
  theme: Theme;
  description: string;
  glyph: string;
};

export const avatarOptions: AvatarOption[] = [
  { key: "ember_smith", name: "Ember Smith", theme: "forge", description: "A hammer-wielding builder who powers ancient machines.", glyph: "ES" },
  { key: "rune_ranger", name: "Rune Ranger", theme: "fantasy", description: "A quick scout from the old forest roads.", glyph: "RR" },
  { key: "star_mage", name: "Star Mage", theme: "scifi", description: "A cosmic problem-solver who stabilizes reactors.", glyph: "SM" },
  { key: "gear_knight", name: "Gear Knight", theme: "scifi", description: "A plated explorer with a clockwork shield.", glyph: "GK" }
];

export type WorldPresentation = {
  worldName: string;
  environment: "ancient_forge" | "enchanted_ruins" | "starship_foundry" | "arena_keep";
  backdrop: string;
  primaryActionVerb: string;
};

export function worldForTheme(theme: Theme): WorldPresentation {
  if (theme === "fantasy") {
    return {
      worldName: "Eldermath Reach",
      environment: "enchanted_ruins",
      backdrop: "misty towers, rune bridges, and a half-lit gate",
      primaryActionVerb: "restore"
    };
  }
  if (theme === "scifi") {
    return {
      worldName: "Nova Forge Station",
      environment: "starship_foundry",
      backdrop: "reactor glass, star maps, and humming metal walkways",
      primaryActionVerb: "stabilize"
    };
  }
  if (theme === "sports") {
    return {
      worldName: "Arena Keep",
      environment: "arena_keep",
      backdrop: "stone stands, banners, and a glowing training field",
      primaryActionVerb: "train"
    };
  }
  return {
    worldName: "The Ancient LearningForge",
    environment: "ancient_forge",
    backdrop: "molten channels, brass machines, and sleeping anvils",
    primaryActionVerb: "reignite"
  };
}
