import { useState } from "react";
import { Text, TextInput, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../../App";

export function ProblemScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Problem">) {
  const [answer, setAnswer] = useState("");
  const { quest, attempts, currentIndex, feedback, submitAnswer, requestHint, continueQuest } = useGameStore();
  const attempt = attempts[currentIndex];
  if (!attempt) return <Screen><Body>No active quest.</Body></Screen>;
  const answeredCorrectly = feedback?.isCorrect;
  return (
    <Screen>
      <Text style={styles.quest}>{quest?.title}</Text>
      {quest?.flavorText ? <Body>{quest.flavorText}</Body> : null}
      <Body>Problem {currentIndex + 1} of {attempts.length} · {String(attempt.metadata.questRole)}</Body>
      <Panel>
        <Text style={styles.prompt}>{attempt.prompt}</Text>
        {attempt.choices ? (
          <View style={styles.choices}>
            {attempt.choices.map((choice) => (
              <Button key={choice.id} variant="secondary" onPress={() => setAnswer(choice.id)}>{choice.id}. {choice.text}</Button>
            ))}
          </View>
        ) : (
          <TextInput value={answer} onChangeText={setAnswer} style={styles.input} placeholder="Type answer" />
        )}
        <Button onPress={() => submitAnswer(answer)}>Submit</Button>
        <Button variant="secondary" onPress={() => requestHint()}>Hint</Button>
      </Panel>
      {feedback ? (
        <Panel>
          <Text style={[styles.feedback, feedback.isCorrect ? styles.good : styles.tryAgain]}>{feedback.message}</Text>
          {answeredCorrectly ? (
            <Button onPress={() => {
              const done = currentIndex >= attempts.length - 1;
              continueQuest();
              setAnswer("");
              if (done) navigation.replace("QuestComplete");
            }}>Continue</Button>
          ) : null}
        </Panel>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  quest: { fontSize: 22, fontWeight: "800", color: theme.colors.text },
  prompt: { fontSize: 24, lineHeight: 31, fontWeight: "800", color: theme.colors.text },
  input: { minHeight: 48, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, backgroundColor: "#fff", fontSize: 18 },
  choices: { gap: 10 },
  feedback: { fontSize: 16, lineHeight: 22, fontWeight: "700" },
  good: { color: theme.colors.good },
  tryAgain: { color: theme.colors.danger }
});
