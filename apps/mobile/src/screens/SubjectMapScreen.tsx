import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Title, Body } from "../components/ui";
import { learningSubjects, type LearningRoom } from "../content/learningContent";
import { useGameStore } from "../state/useGameStore";
import { theme } from "../theme/theme";
import { SubjectRoomScreen } from "./SubjectRoomScreen";
import type { RootStackParamList } from "../../App";

type SelectedRoom = {
  subjectId: string;
  room: LearningRoom;
};

export function SubjectMapScreen({ navigation }: { navigation: NativeStackNavigationProp<RootStackParamList> }) {
  const [selectedRoom, setSelectedRoom] = useState<SelectedRoom | null>(null);
  const startQuest = useGameStore((state) => state.startQuest);
  const subject = learningSubjects.find((item) => item.id === selectedRoom?.subjectId);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.content}>
        {subject && selectedRoom ? (
          <SubjectRoomScreen
            subject={subject}
            room={selectedRoom.room}
            onBack={() => setSelectedRoom(null)}
            onStartQuest={() => {
              startQuest();
              navigation.navigate("Problem");
            }}
            onOpenActivity={() => navigation.navigate("Problem")}
          />
        ) : (
          <>
            <Title>LearningForge</Title>
            <Body>Choose a subject room. The daily quest stays focused while new subjects preview the same activity flow.</Body>
            {learningSubjects.map((item) => (
              <Panel key={item.id}>
                <Text style={styles.subject}>{item.name}</Text>
                <Body>{item.description}</Body>
                <View style={styles.rooms}>
                  {item.rooms.map((room) => (
                    <Button key={room.id} variant="secondary" onPress={() => setSelectedRoom({ subjectId: item.id, room })}>
                      {room.name}
                    </Button>
                  ))}
                </View>
              </Panel>
            ))}
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: theme.spacing.md, paddingBottom: 32 },
  subject: { fontSize: 21, lineHeight: 27, fontWeight: "900", color: theme.colors.text },
  rooms: { gap: theme.spacing.sm }
});
