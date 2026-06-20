import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, StyleSheet } from "react-native";
import { Button, Panel, Screen, Title, Body } from "../components/ui";
import { currentLevel, useGameStore } from "../state/useGameStore";
import { avatarOptions, worldForTheme } from "@mathforge/shared";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../../App";

export function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Home">) {
  const { child, xp, coins, quest, startQuest } = useGameStore();
  const level = currentLevel(xp);
  const avatar = avatarOptions.find((item) => item.key === child?.avatarKey);
  const world = worldForTheme(child?.preferredTheme ?? "forge");
  return (
    <Screen>
      <Title>Welcome back, {child?.displayName ?? "Player"}</Title>
      <View style={styles.stats}>
        <Text style={styles.stat}>Level {level.level}</Text>
        <Text style={styles.stat}>{level.xpIntoLevel}/{level.xpToNextLevel} XP</Text>
        <Text style={styles.stat}>{coins} coins</Text>
      </View>
      <Panel>
        <Text style={styles.forge}>{world.worldName}</Text>
        <Body>{world.backdrop}</Body>
        <Text style={styles.avatar}>{avatar?.glyph ?? "ES"} · {avatar?.name ?? "Ember Smith"}</Text>
      </Panel>
      <Panel>
        <Text style={styles.cardTitle}>{quest?.title ?? "Daily MathForge Quest"}</Text>
        <Body>{quest?.flavorText ?? "Eight problems. One focused run. Rewards at the end."}</Body>
        <Button onPress={() => { startQuest(); navigation.navigate("Problem"); }}>Start Daily Quest</Button>
      </Panel>
      <Button variant="secondary" onPress={() => navigation.navigate("SkillMap")}>Skill Map</Button>
      <Button variant="secondary" onPress={() => navigation.navigate("Forge")}>Forge Upgrades</Button>
      <Button variant="secondary" onPress={() => navigation.navigate("ParentDashboard")}>Parent Dashboard</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stats: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  stat: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: theme.colors.surface, color: theme.colors.text, fontWeight: "700" },
  forge: { fontSize: 22, fontWeight: "800", color: theme.colors.accentDark },
  avatar: { fontSize: 15, fontWeight: "800", color: theme.colors.text },
  cardTitle: { fontSize: 20, fontWeight: "800", color: theme.colors.text }
});
