import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Link } from "expo-router";
import { SPOT_CATEGORIES, scoreColor, type ColorPalette, type SpotCategory } from "@spot/shared";
import { useNearbySpots } from "@/hooks/use-nearby-spots";
import { useTheme } from "@/context/theme-context";

type ViewMode = "map" | "list";
type SortMode = "score" | "distance" | "newest";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "distance", label: "Entfernung" },
  { value: "score", label: "Score" },
  { value: "newest", label: "Neueste" },
];

export default function MapScreen() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [activeCategory, setActiveCategory] = useState<SpotCategory | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("map");
  const [sortMode, setSortMode] = useState<SortMode>("distance");

  const { spots, location, loading, error, refresh } = useNearbySpots(activeCategory);

  const sortedSpots = useMemo(() => {
    const copy = [...spots];
    if (sortMode === "score") copy.sort((a, b) => b.score - a.score);
    else if (sortMode === "newest") copy.sort((a, b) => b.created_at.localeCompare(a.created_at));
    else copy.sort((a, b) => a.distance_meters - b.distance_meters);
    return copy;
  }, [spots, sortMode]);

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
          <View style={styles.toggleGroup}>
            {SORT_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setSortMode(option.value)}
                style={[styles.toggleButton, sortMode === option.value && styles.toggleButtonActive]}
              >
                <Text style={[styles.toggleText, sortMode === option.value && styles.toggleTextActive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
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
              onCalloutPress={() => {}}
            />
          ))}
        </MapView>
      )}

      {!loading && !error && viewMode === "list" && (
        <FlatList
          data={sortedSpots}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Keine Spots in deiner Naehe gefunden.</Text>}
          renderItem={({ item }) => (
            <Link href={`/spot/${item.id}`} asChild>
              <Pressable style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={[styles.cardScore, { color: scoreColor(item.score, colors) }]}>
                    {item.score.toFixed(0)}
                  </Text>
                </View>
                <Text style={styles.cardSubtitle}>
                  {item.address} · {(item.distance_meters / 1000).toFixed(1)} km
                </Text>
              </Pressable>
            </Link>
          )}
        />
      )}
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    filterRow: { padding: 12, gap: 8 },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: colors.bgCard,
      marginRight: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    chipActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    chipText: { color: colors.textSecondary, fontWeight: "600" },
    chipTextActive: { color: "#ffffff" },
    toolbar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 12, paddingBottom: 8, gap: 8 },
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
    centered: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
    error: { color: colors.scoreLow },
    retryButton: {
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    retryText: { color: colors.textPrimary },
    map: { flex: 1 },
    list: { padding: 12, gap: 10 },
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
