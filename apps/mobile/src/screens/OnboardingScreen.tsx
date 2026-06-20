import { useState } from "react";
import { Text, TextInput, StyleSheet, View, Pressable } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Button, Panel, Screen, Title, Body } from "../components/ui";
import { useGameStore, visibleAvatars } from "../state/useGameStore";
import { theme } from "../theme/theme";
import type { RootStackParamList } from "../../App";

export function OnboardingScreen({ navigation }: NativeStackScreenProps<RootStackParamList, "Onboarding">) {
  const [name, setName] = useState("Player");
  const [interests, setInterests] = useState("soccer, Minecraft");
  const [avatarKey, setAvatarKey] = useState(visibleAvatars[0].key);
  const createProfile = useGameStore((state) => state.createProfile);
  return (
    <Screen>
      <Title>LearningForge</Title>
      <Body>Build a learning habit one short quest at a time.</Body>
      <Panel>
        <Body>Display name</Body>
        <TextInput value={name} onChangeText={setName} style={styles.input} />
        <Body>Interests</Body>
        <TextInput value={interests} onChangeText={setInterests} style={styles.input} />
        <Body>Avatar</Body>
        <View style={styles.avatarGrid}>
          {visibleAvatars.map((avatar) => (
            <Pressable key={avatar.key} onPress={() => setAvatarKey(avatar.key)} style={[styles.avatar, avatarKey === avatar.key && styles.avatarSelected]}>
              <Text style={styles.avatarGlyph}>{avatar.glyph}</Text>
              <Text style={styles.avatarName}>{avatar.name}</Text>
            </Pressable>
          ))}
        </View>
        <Button
          onPress={() => {
            createProfile({
              displayName: name,
              gradeLevel: 6,
              preferredTheme: "forge",
              tutorTone: "coach",
              dailyGoalMinutes: 10,
              avatarKey,
              interests: interests.split(",").map((item) => item.trim()).filter(Boolean)
            });
            navigation.replace("Home");
          }}
        >
          Enter LearningForge
        </Button>
      </Panel>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { minHeight: 44, borderWidth: 1, borderColor: theme.colors.border, borderRadius: 8, paddingHorizontal: 12, backgroundColor: "#fff", fontSize: 16 },
  avatarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  avatar: { width: "47%", minHeight: 92, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", padding: 10 },
  avatarSelected: { borderColor: theme.colors.accent, backgroundColor: "#fff3e8" },
  avatarGlyph: { fontSize: 22, fontWeight: "900", color: theme.colors.accentDark },
  avatarName: { fontSize: 13, fontWeight: "700", color: theme.colors.text, textAlign: "center" }
});
