import { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { scoreColor, type ColorPalette } from "@spot/shared";
import { useSaves } from "@/hooks/use-saves";
import { useTheme } from "@/context/theme-context";

export default function SavesScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { spots, loading } = useSaves();

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
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
              <Text style={[styles.cardScore, { color: scoreColor(item.score, colors) }]}>
                {item.score.toFixed(0)}
              </Text>
            </View>
            <Text style={styles.cardSubtitle}>{item.address}</Text>
          </Pressable>
        </Link>
      )}
    />
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    centered: { flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" },
    list: { padding: 12, gap: 10, flexGrow: 1 },
    emptyText: { color: colors.textSecondary, textAlign: "center", marginTop: 24 },
    card: {
      backgroundColor: colors.bgCard,
      borderRadius: 12,
      padding: 16,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    cardTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: "700" },
    cardScore: { fontSize: 20, fontWeight: "800" },
    cardSubtitle: { color: colors.textSecondary, marginTop: 4 },
  });
}
