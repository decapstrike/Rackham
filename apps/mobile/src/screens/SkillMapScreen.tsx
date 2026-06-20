import { Text, StyleSheet, ScrollView } from "react-native";
import { Panel, Screen, Body } from "../components/ui";
import { visibleSkills } from "../state/useGameStore";
import { theme } from "../theme/theme";

export function SkillMapScreen() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.list}>
        {visibleSkills.map((skill, index) => (
          <Panel key={skill.id}>
            <Text style={styles.skill}>{skill.name}</Text>
            <Body>{index < 5 ? "Unlocked · Level 1 · Mastery starting" : "Locked · coming after the first forge run"}</Body>
          </Panel>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12, paddingBottom: 32 },
  skill: { fontSize: 18, fontWeight: "800", color: theme.colors.text }
});
