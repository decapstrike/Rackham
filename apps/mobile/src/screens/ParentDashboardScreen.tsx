import { Text, StyleSheet } from "react-native";
import { Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";

export function ParentDashboardScreen() {
  const { attempts, completedQuestCount, totalProblemsAnswered, totalCorrectAnswers } = useGameStore();
  const correct = totalCorrectAnswers || attempts.filter((attempt) => attempt.isCorrect).length;
  const solved = totalProblemsAnswered || attempts.length;
  const accuracy = solved ? Math.round((correct / solved) * 100) : 0;
  const hinted = attempts.filter((attempt) => attempt.hintsUsed > 0).length;
  const needsPractice = attempts.some((attempt) => attempt.problemType === "add_fractions_unlike_denominator" && attempt.hintsUsed > 0)
    ? "Adding fractions with unlike denominators"
    : "Equivalent fractions";
  return (
    <Screen>
      <Panel>
        <Text style={styles.metric}>Last 7 days</Text>
        <Body>Sessions completed: {completedQuestCount}</Body>
        <Body>Activities completed: {solved}</Body>
        <Body>Accuracy: {accuracy}%</Body>
        <Body>Minutes practiced: {completedQuestCount * 10}</Body>
      </Panel>
      <Panel>
        <Text style={styles.metric}>Learning read</Text>
        <Body>Strong skill: Equivalent Fractions</Body>
        <Body>Needs practice: {needsPractice}</Body>
        <Body>Hints used this run: {hinted}</Body>
      </Panel>
      <Panel>
        <Text style={styles.metric}>Summary</Text>
        <Body>{solved ? `Strong start. ${correct} of ${solved} completed activities are correct. Keep the next quest focused on ${needsPractice.toLowerCase()}.` : "No completed quest yet. The first run will create a useful summary."}</Body>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  metric: { fontSize: 20, fontWeight: "800", color: theme.colors.text }
});
