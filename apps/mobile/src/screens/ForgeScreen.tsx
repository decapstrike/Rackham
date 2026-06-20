import { Text, StyleSheet } from "react-native";
import { Button, Panel, Screen, Body } from "../components/ui";
import { useGameStore } from "../state/useGameStore";
import { forgeUpgrades } from "@learningforge/shared";
import { theme } from "../theme/theme";

export function ForgeScreen() {
  const { coins, forge, buyUpgrade } = useGameStore();
  return (
    <Screen>
      <Body>{coins} coins available</Body>
      {forgeUpgrades.map((upgrade) => (
        <Panel key={upgrade.key}>
          <Text style={styles.name}>{upgrade.name}</Text>
          <Body>Level {forge[upgrade.key] ?? 0}/{upgrade.maxLevel} · {upgrade.cost} coins</Body>
          <Button onPress={() => buyUpgrade(upgrade.key, upgrade.cost)}>Upgrade Studio</Button>
        </Panel>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontSize: 20, fontWeight: "800", color: theme.colors.text }
});
