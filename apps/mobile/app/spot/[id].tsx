import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, scoreColor } from "@spot/shared";
import { MOCK_SPOTS } from "@/lib/mock-data";

// TODO: echte Spot-Daten via supabase.from("spots").select(...).eq("id", id).single(),
// plus verknuepfte Videos, aktive Promotions und Rabattcode-Eingabe
// (docs/spec.md Abschnitt 5 und 7.1).
export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const spot = MOCK_SPOTS.find((item) => item.id === id);

  if (!spot) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Spot nicht gefunden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{spot.name}</Text>
      <Text style={[styles.score, { color: scoreColor(spot.score) }]}>{spot.score.toFixed(0)}</Text>
      <Text style={styles.text}>{spot.address}, {spot.city}</Text>
      {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 16, gap: 8 },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: "800" },
  score: { fontSize: 40, fontWeight: "900" },
  text: { color: COLORS.textSecondary },
  description: { color: COLORS.textPrimary, marginTop: 8, lineHeight: 20 },
});
