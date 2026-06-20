import { useEffect, useState } from "react";
import { Text, TextInput, StyleSheet, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";
import { activityTitle, subjectNameFor } from "../content/learningContent";
import type { RootStackParamList } from "../../App";

export function ProblemScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Problem">) {
  const [answer, setAnswer] = useState("");
  const [previewFeedback, setPreviewFeedback] = useState<{ message: string; isCorrect: boolean } | null>(null);
  const { quest, attempts, currentIndex, feedback, selectedActivity, submitAnswer, requestHint, continueQuest, clearSelectedActivity } = useGameStore();
  const attempt = attempts[currentIndex];
  const activity = selectedActivity ?? attempt;

  useEffect(() => {
    setAnswer("");
    setPreviewFeedback(null);
  }, [activity?.id]);

  if (!activity) return <Screen><Body>No active activity.</Body></Screen>;

  const isPreview = selectedActivity !== undefined;
  const activeFeedback = isPreview ? previewFeedback : feedback;
  const answeredCorrectly = activeFeedback?.isCorrect;
  const subjectName = subjectNameFor(activity.subjectId);
  const title = selectedActivity?.title ?? activityTitle(activity.activityType);
  const activityOrder = Number(activity.metadata.order) || currentIndex + 1;
  const activityRole = typeof activity.metadata.questRole === "string" ? activity.metadata.questRole : "practice";
  const progressLabel = isPreview
    ? `${subjectName} preview`
    : `Activity ${activityOrder} of ${attempts.length} · ${subjectName} · ${activityRole}`;

  const handleSubmit = () => {
    if (isPreview) {
      const isCorrect = normalizeAnswer(answer) === normalizeAnswer(activity.correctAnswer);
      setPreviewFeedback({
        isCorrect,
        message: isCorrect ? `Nice. ${activity.explanation}` : `Close. ${activity.hintSequence[0]}`
      });
      return;
    }
    submitAnswer(answer);
  };

  const handleHint = () => {
    if (isPreview) {
      setPreviewFeedback({ isCorrect: false, message: activity.hintSequence[0] });
      return;
    }
    requestHint();
  };

  return (
    <Screen>
      <Text style={styles.quest}>{selectedActivity ? title : quest?.title}</Text>
      {selectedActivity ? <Body>{subjectName} · {title}</Body> : null}
      {!selectedActivity && quest?.flavorText ? <Body>{quest.flavorText}</Body> : null}
      <Body>{progressLabel}</Body>
      <Panel>
        <Text style={styles.prompt}>{activity.prompt}</Text>
        {activity.choices ? (
          <View style={styles.choices}>
            {activity.choices.map((choice) => (
              <Button key={choice.id} variant={answer === choice.id ? "primary" : "secondary"} onPress={() => setAnswer(choice.id)}>{choice.id}. {choice.text}</Button>
            ))}
          </View>
        ) : (
          <TextInput value={answer} onChangeText={setAnswer} style={styles.input} placeholder="Type answer" />
        )}
        <Button onPress={handleSubmit}>Submit</Button>
        <Button variant="secondary" onPress={handleHint}>Hint</Button>
      </Panel>
      {activeFeedback ? (
        <Panel>
          <Text style={[styles.feedback, activeFeedback.isCorrect ? styles.good : styles.tryAgain]}>{activeFeedback.message}</Text>
          {answeredCorrectly ? (
            <Button onPress={() => {
              if (isPreview) {
                clearSelectedActivity();
                navigation.goBack();
                return;
              }
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

function normalizeAnswer(value: string) {
  return value.trim().toLowerCase();
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
