import { Text, StyleSheet, View } from "react-native";
import { Button, Panel, Body } from "../components/ui";
import { displayActivities, type LearningRoom, type LearningSubject } from "../content/learningContent";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";

type SubjectRoomScreenProps = {
  subject: LearningSubject;
  room: LearningRoom;
  onBack: () => void;
  onStartQuest: () => void;
  onOpenActivity: () => void;
};

export function SubjectRoomScreen({ subject, room, onBack, onStartQuest, onOpenActivity }: SubjectRoomScreenProps) {
  const selectActivity = useGameStore((state) => state.selectActivity);
  const activities = room.activityIds
    .map((activityId) => displayActivities.find((activity) => activity.id === activityId))
    .filter((activity) => activity !== undefined);

  return (
    <View style={styles.container}>
      <Button variant="secondary" onPress={onBack}>Back to Subjects</Button>
      <Panel>
        <Text style={styles.eyebrow}>{subject.name}</Text>
        <Text style={styles.title}>{room.name}</Text>
        <Body>{room.description}</Body>
        <Text style={styles.status}>{statusLabel(room.status)}</Text>
      </Panel>
      {room.status !== "locked" ? (
        <Panel>
          <Text style={styles.activityTitle}>{subject.id === "math" ? "Daily Quest" : "Preview Quest"}</Text>
          <Body>Play a local {subject.name.toLowerCase()} quest with rewards and progress.</Body>
          <Button onPress={onStartQuest}>{subject.id === "math" ? "Start Daily Quest" : "Start Preview Quest"}</Button>
        </Panel>
      ) : null}
      {activities.map((activity) => (
        <Panel key={activity.id}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Body>{activity.prompt}</Body>
          <Button
            variant={room.status === "ready" ? "secondary" : "primary"}
            onPress={() => {
              selectActivity(activity);
              onOpenActivity();
            }}
          >
            Try Activity
          </Button>
        </Panel>
      ))}
      {activities.length === 0 ? (
        <Panel>
          <Body>This room is not open yet. Keep the daily quest loop focused for now.</Body>
        </Panel>
      ) : null}
    </View>
  );
}

function statusLabel(status: LearningRoom["status"]) {
  if (status === "ready") return "Ready";
  if (status === "preview") return "Preview";
  return "Locked";
}

const styles = StyleSheet.create({
  container: { gap: theme.spacing.md },
  eyebrow: { fontSize: 13, fontWeight: "900", color: theme.colors.accentDark, textTransform: "uppercase" },
  title: { fontSize: 24, lineHeight: 30, fontWeight: "900", color: theme.colors.text },
  status: { fontSize: 14, fontWeight: "800", color: theme.colors.good },
  activityTitle: { fontSize: 19, fontWeight: "900", color: theme.colors.text }
});
