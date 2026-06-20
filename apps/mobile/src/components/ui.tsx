import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps, type ViewProps } from "react-native";
import { theme } from "../theme/theme";

export function Screen({ children }: ViewProps) {
  return <View style={styles.screen}>{children}</View>;
}

export function Panel({ children }: ViewProps) {
  return <View style={styles.panel}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Body({ children }: { children: ReactNode }) {
  return <Text style={styles.body}>{children}</Text>;
}

export function Button({ children, variant = "primary", ...props }: PressableProps & { children: ReactNode; variant?: "primary" | "secondary" }) {
  return (
    <Pressable {...props} style={({ pressed }) => [styles.button, variant === "secondary" && styles.secondaryButton, pressed && styles.pressed]}>
      <Text style={[styles.buttonText, variant === "secondary" && styles.secondaryButtonText]}>{children}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: theme.spacing.md, gap: theme.spacing.md, backgroundColor: theme.colors.background },
  panel: { padding: theme.spacing.md, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.border, backgroundColor: theme.colors.surface, gap: theme.spacing.sm },
  title: { fontSize: 28, lineHeight: 34, fontWeight: "800", color: theme.colors.text },
  body: { fontSize: 16, lineHeight: 22, color: theme.colors.muted },
  button: { minHeight: 48, borderRadius: 8, backgroundColor: theme.colors.accent, alignItems: "center", justifyContent: "center", paddingHorizontal: theme.spacing.md },
  secondaryButton: { backgroundColor: "transparent", borderWidth: 1, borderColor: theme.colors.accent },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  secondaryButtonText: { color: theme.colors.accentDark },
  pressed: { opacity: 0.72 }
});
