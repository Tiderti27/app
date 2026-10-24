import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import type { ColorPalette, SpotWithDistance } from "@spot/shared";
import { ScoreBadge } from "@/components/score-badge";
import { SpotThumb } from "@/components/spot-thumb";

export function SpotCarousel({
  title,
  spots,
  colors,
}: {
  title: string;
  spots: SpotWithDistance[];
  colors: ColorPalette;
}) {
  const styles = createStyles(colors);

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={spots}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.row}
        renderItem={({ item }) => (
          <Link href={`/spot/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <SpotThumb
                photoUrl={item.photos[0]}
                category={item.category}
                bgColor={colors.bgElevated}
                iconColor={colors.textSecondary}
                size={44}
                iconSize={22}
                style={styles.cardIcon}
              />
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.name}
                </Text>
                <ScoreBadge score={item.score} colors={colors} />
              </View>
              <Text style={styles.cardMeta} numberOfLines={1}>
                {(item.distance_meters / 1000).toFixed(1)} km
              </Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    section: { gap: 10 },
    title: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", paddingHorizontal: 20 },
    row: { paddingHorizontal: 20, gap: 10 },
    card: {
      width: 140,
      gap: 8,
      backgroundColor: colors.bgCard,
      borderRadius: 16,
      padding: 12,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    cardIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.bgElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 6 },
    cardTitle: { color: colors.textPrimary, fontSize: 13, fontWeight: "700", flexShrink: 1 },
    cardMeta: { color: colors.textSecondary, fontSize: 11.5 },
  });
}
