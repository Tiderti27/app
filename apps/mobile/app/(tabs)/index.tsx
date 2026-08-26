import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { COLORS, SPOT_CATEGORIES, scoreColor, type SpotCategory } from "@spot/shared";
import { MOCK_SPOTS } from "@/lib/mock-data";

// TODO: Kartenansicht (react-native-maps) statt Liste, Umkreissuche via
// supabase.rpc gegen die PostGIS-Funktionen aus docs/spec.md Abschnitt 11.
export default function MapScreen() {
  const [activeCategory, setActiveCategory] = useState<SpotCategory | null>(null);

  const spots = activeCategory
    ? MOCK_SPOTS.filter((spot) => spot.category === activeCategory)
    : MOCK_SPOTS;

  return (
    <View style={styles.container}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={SPOT_CATEGORIES}
        keyExtractor={(item) => item.value}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => {
          const active = activeCategory === item.value;
          return (
            <Pressable
              onPress={() => setActiveCategory(active ? null : item.value)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      <FlatList
        data={spots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Link href={`/spot/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text style={[styles.cardScore, { color: scoreColor(item.score) }]}>
                  {item.score.toFixed(0)}
                </Text>
              </View>
              <Text style={styles.cardSubtitle}>{item.address}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  filterRow: { padding: 12, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.bgCard,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipActive: { backgroundColor: COLORS.accentPrimary, borderColor: COLORS.accentPrimary },
  chipText: { color: COLORS.textSecondary, fontWeight: "600" },
  chipTextActive: { color: COLORS.textPrimary },
  list: { padding: 12, gap: 10 },
  card: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "700" },
  cardScore: { fontSize: 20, fontWeight: "800" },
  cardSubtitle: { color: COLORS.textSecondary, marginTop: 4 },
});
