import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProblemScreen } from "./src/screens/ProblemScreen";
import { QuestCompleteScreen } from "./src/screens/QuestCompleteScreen";
import { SkillMapScreen } from "./src/screens/SkillMapScreen";
import { ForgeScreen } from "./src/screens/ForgeScreen";
import { ParentDashboardScreen } from "./src/screens/ParentDashboardScreen";
import { SettingsScreen } from "./src/screens/SettingsScreen";
import { theme } from "./src/theme/theme";

export type RootStackParamList = {
  Onboarding: undefined;
  Home: undefined;
  Problem: undefined;
  QuestComplete: undefined;
  SkillMap: undefined;
  Forge: undefined;
  ParentDashboard: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.background },
          headerTintColor: theme.colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "MathForge" }} />
        <Stack.Screen name="Problem" component={ProblemScreen} options={{ title: "Daily Quest" }} />
        <Stack.Screen name="QuestComplete" component={QuestCompleteScreen} options={{ title: "Quest Complete" }} />
        <Stack.Screen name="SkillMap" component={SkillMapScreen} options={{ title: "Skill Map" }} />
        <Stack.Screen name="Forge" component={ForgeScreen} options={{ title: "Forge" }} />
        <Stack.Screen name="ParentDashboard" component={ParentDashboardScreen} options={{ title: "Parent Dashboard" }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
