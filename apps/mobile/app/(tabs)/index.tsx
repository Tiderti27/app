import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Link, useRouter } from "expo-router";
import { SPOT_CATEGORIES, scoreColor, type ColorPalette, type SpotCategory, type SpotWithDistance } from "@spot/shared";
import { useNearbySpots } from "@/hooks/use-nearby-spots";
import { useSaves } from "@/hooks/use-saves";
import { useTheme } from "@/context/theme-context";
import { CategoryIcon, PinIcon, SortIcon, UserIcon } from "@/components/icons";
import { ScoreBadge } from "@/components/score-badge";
import { SpotCarousel } from "@/components/spot-carousel";
import { SpotThumb } from "@/components/spot-thumb";
import { SpotSearchBar } from "@/components/spot-search-bar";

type ViewMode = "map" | "list";
type SortMode = "score" | "distance" | "newest";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "distance", label: "Entfernung" },
  { value: "score", label: "Score" },
  { value: "newest", label: "Neueste" },
];

function nextSortMode(current: SortMode): SortMode {
  const index = SORT_OPTIONS.findIndex((option) => option.value === current);
  return SORT_OPTIONS[(index + 1) % SORT_OPTIONS.length].value;
}

export default function MapScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<SpotCategory | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [sortMode, setSortMode] = useState<SortMode>("distance");

  const { spots, location, loading, error, refresh } = useNearbySpots(activeCategory);
  const { spots: savedSpots } = useSaves();

  const sortedSpots = useMemo(() => {
    const copy = [...spots];
    if (sortMode === "score") copy.sort((a, b) => b.score - a.score);
    else if (sortMode === "newest") copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else copy.sort((a, b) => a.distance_meters - b.distance_meters);
    return copy;
  }, [spots, sortMode]);

  const popularSpots = useMemo(() => [...spots].sort((a, b) => b.score - a.score).slice(0, 10), [spots]);
  const nearbySpots = useMemo(
    () => [...spots].sort((a, b) => a.distance_meters - b.distance_meters).slice(0, 10),
    [spots]
  );

  const forYouSpots = useMemo(() => {
    if (savedSpots.length > 0) {
      const categoryCounts = new Map<string, number>();
      for (const saved of savedSpots) {
        categoryCounts.set(saved.category, (categoryCounts.get(saved.category) ?? 0) + 1);
      }
      const topCategory = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
      if (topCategory) {
        const savedIds = new Set(savedSpots.map((saved) => saved.id));
        const matches = spots
          .filter((spot) => spot.category === topCategory && !savedIds.has(spot.id))
          .sort((a, b) => b.score - a.score);
        if (matches.length > 0) return matches.slice(0, 10);
      }
    }

    const bestPerCategory = new Map<string, SpotWithDistance>();
    for (const spot of spots) {
      const current = bestPerCategory.get(spot.category);
      if (!current || spot.score > current.score) bestPerCategory.set(spot.category, spot);
    }
    return [...bestPerCategory.values()].sort((a, b) => b.score - a.score);
  }, [spots, savedSpots]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandRow}>
          <PinIcon size={19} color={colors.accentPrimary} />
          <Text style={styles.brand}>Spot</Text>
        </View>
        <Pressable style={styles.avatar} onPress={() => router.push("/(tabs)/profile")}>
          <UserIcon size={16} color={colors.textSecondary} />
        </Pressable>
      </View>

      <SpotSearchBar colors={colors} />

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={true}
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
              <CategoryIcon category={item.value} size={14} color={active ? "#ffffff" : colors.textSecondary} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
            </Pressable>
          );
        }}
      />

      <View style={styles.toolbar}>
        <View style={styles.toggleGroup}>
          <Pressable
            onPress={() => setViewMode("map")}
            style={[styles.toggleButton, viewMode === "map" && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleText, viewMode === "map" && styles.toggleTextActive]}>Karte</Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode("list")}
            style={[styles.toggleButton, viewMode === "list" && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleText, viewMode === "list" && styles.toggleTextActive]}>Liste</Text>
          </Pressable>
        </View>

        {viewMode === "list" && (
          <Pressable style={styles.sortButton} onPress={() => setSortMode(nextSortMode(sortMode))}>
            <SortIcon size={13} color={colors.textSecondary} />
            <Text style={styles.sortButtonText}>
              {SORT_OPTIONS.find((option) => option.value === sortMode)?.label}
            </Text>
          </Pressable>
        )}
      </View>

      {loading && (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.accentPrimary} />
        </View>
      )}

      {!loading && error && (
        <View style={styles.centered}>
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Erneut versuchen</Text>
          </Pressable>
        </View>
      )}

      {!loading && !error && viewMode === "map" && location && (
        <MapView
          provider={PROVIDER_DEFAULT}
          style={styles.map}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
          showsUserLocation
        >
          {sortedSpots.map((spot) => (
            <Marker
              key={spot.id}
              coordinate={{ latitude: spot.latitude, longitude: spot.longitude }}
              title={spot.name}
              description={`Score ${spot.score.toFixed(0)}`}
              pinColor={scoreColor(spot.score, colors)}
              onCalloutPress={() => router.push(`/spot/${spot.id}`)}
            />
          ))}
        </MapView>
      )}

      {!loading && !error && viewMode === "list" && (
        <View style={styles.list}>
          {sortedSpots.length === 0 && <Text style={styles.emptyText}>Keine Spots in deiner Naehe gefunden.</Text>}
          {sortedSpots.map((item) => (
            <Link key={item.id} href={`/spot/${item.id}`} asChild>
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
                    {item.address} · {(item.distance_meters / 1000).toFixed(1)} km
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      )}

      {!loading && !error && popularSpots.length > 0 && (
        <SpotCarousel title="🔥 Aktuell beliebt" spots={popularSpots} colors={colors} />
      )}
      {!loading && !error && forYouSpots.length > 0 && (
        <SpotCarousel title="✨ Für dich" spots={forYouSpots} colors={colors} />
      )}
      {!loading && !error && nearbySpots.length > 0 && (
        <SpotCarousel title="📍 In deiner Nähe" spots={nearbySpots} colors={colors} />
      )}
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { paddingBottom: 32, gap: 24 },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    brandRow: { flexDirection: "row", alignItems: "center", gap: 7 },
    brand: { fontSize: 17, fontWeight: "800", color: colors.textPrimary },
    avatar: {
      width: 34,
      height: 34,
      borderRadius: 17,
      backgroundColor: colors.bgElevated,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
    },
    filterRow: { paddingHorizontal: 20, gap: 8 },
    chip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 9,
      borderRadius: 999,
      backgroundColor: colors.bgCard,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    chipText: { color: colors.textSecondary, fontWeight: "600", fontSize: 13 },
    chipTextActive: { color: "#ffffff" },
    toolbar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      gap: 8,
    },
    toggleGroup: { flexDirection: "row", gap: 6 },
    toggleButton: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleButtonActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    toggleText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
    toggleTextActive: { color: "#ffffff" },
    sortButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
    },
    sortButtonText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
    centered: { alignItems: "center", justifyContent: "center", gap: 12, paddingVertical: 40 },
    error: { color: colors.scoreLow },
    retryButton: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    retryText: { color: colors.textPrimary },
    map: { height: 280, marginHorizontal: 20, borderRadius: 20, overflow: "hidden" },
    list: { paddingHorizontal: 20, gap: 12 },
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
