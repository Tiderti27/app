import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { COLORS, scoreColor } from "@spot/shared";
import { useSaves } from "@/hooks/use-saves";

export default function SavesScreen() {
  const { spots, loading } = useSaves();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accentPrimary} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.list}
      data={spots}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={<Text style={styles.emptyText}>Noch keine gespeicherten Spots.</Text>}
      renderItem={({ item }) => (
        <Link href={`/spot/${item.id}`} asChild>
          <Pressable style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={[styles.cardScore, { color: scoreColor(item.score) }]}>{item.score.toFixed(0)}</Text>
            </View>
            <Text style={styles.cardSubtitle}>{item.address}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  centered: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: "center", justifyContent: "center" },
  list: { padding: 12, gap: 10, flexGrow: 1 },
  emptyText: { color: COLORS.textSecondary, textAlign: "center", marginTop: 24 },
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
