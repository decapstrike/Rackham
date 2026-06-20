import { Text, StyleSheet } from "react-native";
import { Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";

export function ParentDashboardScreen() {
  const { attempts, quest } = useGameStore();
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  const accuracy = attempts.length ? Math.round((correct / attempts.length) * 100) : 0;
  return (
    <Screen>
      <Panel>
        <Text style={styles.metric}>Last 7 days</Text>
        <Body>Sessions completed: {quest?.status === "completed" ? 1 : 0}</Body>
        <Body>Problems solved: {attempts.filter((attempt) => attempt.isCorrect).length}</Body>
        <Body>Accuracy: {accuracy}%</Body>
        <Body>Minutes practiced: {quest?.status === "completed" ? 10 : 0}</Body>
      </Panel>
      <Panel>
        <Text style={styles.metric}>Summary</Text>
        <Body>{attempts.length ? "Strong start. Fraction practice is producing real attempts, and unlike denominators should stay in the next run." : "No completed quest yet. The first run will create a useful summary."}</Body>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metric: { fontSize: 20, fontWeight: "800", color: theme.colors.text }
});
