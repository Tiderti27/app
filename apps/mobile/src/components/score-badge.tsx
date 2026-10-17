import { StyleSheet, Text, View } from "react-native";
import { scoreColor, type ColorPalette } from "@spot/shared";

interface ScoreBadgeProps {
  score: number;
  colors: ColorPalette;
  size?: "small" | "large";
}

export function ScoreBadge({ score, colors, size = "small" }: ScoreBadgeProps) {
  const color = scoreColor(score, colors);
  const large = size === "large";

  return (
    <View
      style={[
        styles.badge,
        large ? styles.badgeLarge : styles.badgeSmall,
        { backgroundColor: color + "22" },
      ]}
    >
      <Text style={[styles.text, large ? styles.textLarge : styles.textSmall, { color }]}>
        {score.toFixed(0)}
      </Text>
      {large && <Text style={[styles.label, { color }]}>SCORE</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignItems: "center", justifyContent: "center" },
  badgeSmall: { borderRadius: 9, paddingHorizontal: 8, paddingVertical: 3 },
  badgeLarge: { width: 68, height: 68, borderRadius: 18 },
  text: { fontWeight: "800" },
  textSmall: { fontSize: 13 },
  textLarge: { fontSize: 24, lineHeight: 26 },
  label: { fontSize: 8.5, fontWeight: "700", letterSpacing: 0.4, marginTop: 1 },
});
