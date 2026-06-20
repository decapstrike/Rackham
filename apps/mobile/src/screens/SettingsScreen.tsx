import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import type { RootStackParamList } from "../../App";

export function SettingsScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Settings">) {
  const { child, resetPrototype } = useGameStore();
  return (
    <Screen>
      <Panel>
        <Body>Grade {child?.gradeLevel ?? 6} · {child?.preferredTheme ?? "forge"} theme · {child?.tutorTone ?? "coach"} tone · {child?.dailyGoalMinutes ?? 10} minute daily goal</Body>
        <Body>Avatar: {child?.avatarKey ?? "ember_smith"}</Body>
      </Panel>
      <Panel>
        <Body>Prototype reset clears the local child profile and progress on this device.</Body>
        <Button
          variant="secondary"
          onPress={() => {
            resetPrototype();
            navigation.replace("Onboarding");
          }}
        >
          Reset Prototype
        </Button>
      </Panel>
    </Screen>
  );
}
