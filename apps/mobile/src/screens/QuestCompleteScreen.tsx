import { Text, StyleSheet } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Title, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../../App";

export function QuestCompleteScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "QuestComplete">) {
  const { quest, attempts, xp, coins } = useGameStore();
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  return (
    <Screen>
      <Title>Quest complete</Title>
      <Body>{quest?.title ?? "Daily quest"} is done. The forge is glowing again.</Body>
      <Panel>
        <Text style={styles.reward}>{xp} XP</Text>
        <Text style={styles.reward}>{coins} coins</Text>
        <Body>Accuracy: {correct}/{attempts.length}</Body>
      </Panel>
      <Button onPress={() => navigation.replace("Home")}>Continue</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  reward: { fontSize: 24, fontWeight: "900", color: theme.colors.gold }
});
