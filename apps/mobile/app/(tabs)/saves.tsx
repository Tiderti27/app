import { useMemo } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import type { ColorPalette } from "@spot/shared";
import { useSaves } from "@/hooks/use-saves";
import { useTheme } from "@/context/theme-context";
import { SpotThumb } from "@/components/spot-thumb";
import { ScoreBadge } from "@/components/score-badge";

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
            <SpotThumb
              photoUrl={item.photos[0]}
              category={item.category}
              bgColor={colors.bgElevated}
              iconColor={colors.textSecondary}
              size={64}
              iconSize={24}
              style={styles.cardIcon}
            />
            <View style={styles.cardBody}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <ScoreBadge score={item.score} colors={colors} />
              </View>
              <Text style={styles.cardSubtitle} numberOfLines={1}>
                {item.address}
              </Text>
            </View>
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
    list: { padding: 20, gap: 12, flexGrow: 1 },
    emptyText: { color: colors.textSecondary, textAlign: "center", marginTop: 24 },
    card: {
      flexDirection: "row",
      gap: 12,
      backgroundColor: colors.bgCard,
      borderRadius: 18,
      padding: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 64,
      height: 64,
      borderRadius: 14,
      backgroundColor: colors.bgElevated,
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    cardBody: { flex: 1, minWidth: 0, gap: 4, justifyContent: "center" },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
    cardTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", flexShrink: 1 },
    cardSubtitle: { color: colors.textSecondary, fontSize: 12.5 },
  });
}
