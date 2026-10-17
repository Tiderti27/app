import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import type { ColorPalette, VideoPlatform } from "@spot/shared";
import { useCreator, type SpotOption } from "@/hooks/use-creator";
import { PlayIcon } from "@/components/icons";

const PLATFORMS: { value: VideoPlatform; label: string }[] = [
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
];

export function CreatorPanel({ colors }: { colors: ColorPalette }) {
  const styles = createStyles(colors);
  const { videos, stats, loading, addVideo, removeVideo, searchSpots } = useCreator(true);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SpotOption[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<SpotOption | null>(null);
  const [platform, setPlatform] = useState<VideoPlatform>("tiktok");
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [isCooperation, setIsCooperation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleQueryChange(value: string) {
    setQuery(value);
    setSelectedSpot(null);
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    setSuggestions(await searchSpots(value));
  }

  async function handleSubmit() {
    setError(null);
    if (!selectedSpot) {
      setError("Bitte einen Spot aus der Liste auswaehlen.");
      return;
    }
    if (!url.trim()) {
      setError("Bitte einen Video-Link angeben.");
      return;
    }

    setSubmitting(true);
    const submitError = await addVideo({ spotId: selectedSpot.id, platform, url: url.trim(), title: title.trim(), isCooperation });
    setSubmitting(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    setQuery("");
    setSelectedSpot(null);
    setUrl("");
    setTitle("");
    setIsCooperation(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>Creator</Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.total_redemptions ?? 0}</Text>
          <Text style={styles.statLabel}>Einlösungen</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{(stats?.total_earnings ?? 0).toFixed(2)} €</Text>
          <Text style={styles.statLabel}>Einnahmen</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats?.active_cooperations ?? 0}</Text>
          <Text style={styles.statLabel}>Kooperationen</Text>
        </View>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Video verknüpfen</Text>

        <View style={styles.fieldGroup}>
          <TextInput
            style={styles.input}
            placeholder="Spot suchen..."
            placeholderTextColor={colors.textSecondary}
            value={selectedSpot ? selectedSpot.name : query}
            onChangeText={handleQueryChange}
          />
          {suggestions.length > 0 && !selectedSpot && (
            <View style={styles.suggestions}>
              {suggestions.map((spot) => (
                <Pressable
                  key={spot.id}
                  style={styles.suggestionRow}
                  onPress={() => {
                    setSelectedSpot(spot);
                    setSuggestions([]);
                  }}
                >
                  <Text style={styles.suggestionText}>
                    {spot.name} <Text style={styles.suggestionCity}>· {spot.city}</Text>
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View style={styles.platformRow}>
          {PLATFORMS.map((option) => (
            <Pressable
              key={option.value}
              style={[styles.platformChip, platform === option.value && styles.platformChipActive]}
              onPress={() => setPlatform(option.value)}
            >
              <Text style={[styles.platformChipText, platform === option.value && styles.platformChipTextActive]}>
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Video-Link (https://...)"
          placeholderTextColor={colors.textSecondary}
          autoCapitalize="none"
          value={url}
          onChangeText={setUrl}
        />
        <TextInput
          style={styles.input}
          placeholder="Titel (optional)"
          placeholderTextColor={colors.textSecondary}
          value={title}
          onChangeText={setTitle}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Bezahlte Kooperation</Text>
          <Switch
            value={isCooperation}
            onValueChange={setIsCooperation}
            trackColor={{ false: colors.border, true: colors.accentPrimary }}
            thumbColor="#ffffff"
          />
        </View>

        {error && <Text style={styles.error}>{error}</Text>}

        <Pressable style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.submitButtonText}>Video hinzufügen</Text>}
        </Pressable>
      </View>

      <View style={styles.videoList}>
        {loading && <ActivityIndicator color={colors.accentPrimary} />}
        {!loading && videos.length === 0 && <Text style={styles.emptyText}>Noch keine Videos verknüpft.</Text>}
        {videos.map((video) => (
          <View key={video.id} style={styles.videoRow}>
            <View style={styles.videoThumb}>
              <PlayIcon size={16} color={colors.textSecondary} />
            </View>
            <View style={styles.videoInfo}>
              <Text style={styles.videoSpot} numberOfLines={1}>
                {video.spot_name}
              </Text>
              <Text style={styles.videoMeta} numberOfLines={1}>
                {video.platform} {video.is_cooperation ? "· Kooperation" : ""}
              </Text>
            </View>
            <Pressable style={styles.removeButton} onPress={() => removeVideo(video.id)}>
              <Text style={styles.removeButtonText}>Entfernen</Text>
            </Pressable>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(colors: ColorPalette) {
  return StyleSheet.create({
    container: { gap: 14 },
    sectionLabel: {
      color: colors.textSecondary,
      fontSize: 12,
      fontWeight: "700",
      letterSpacing: 0.04,
      textTransform: "uppercase",
    },
    statRow: { flexDirection: "row", gap: 8 },
    statCard: {
      flex: 1,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 12,
      alignItems: "center",
      gap: 2,
    },
    statValue: { color: colors.textPrimary, fontSize: 15, fontWeight: "800" },
    statLabel: { color: colors.textSecondary, fontSize: 10.5, fontWeight: "600", textAlign: "center" },
    formCard: {
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      gap: 10,
    },
    formTitle: { color: colors.textPrimary, fontSize: 13.5, fontWeight: "700" },
    fieldGroup: { position: "relative", zIndex: 10 },
    input: {
      backgroundColor: colors.bgElevated,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 10,
      paddingHorizontal: 13,
      paddingVertical: 11,
      color: colors.textPrimary,
      fontSize: 13.5,
    },
    suggestions: {
      marginTop: 4,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      overflow: "hidden",
    },
    suggestionRow: { paddingHorizontal: 13, paddingVertical: 10 },
    suggestionText: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
    suggestionCity: { color: colors.textSecondary, fontWeight: "400" },
    platformRow: { flexDirection: "row", gap: 6 },
    platformChip: {
      flex: 1,
      alignItems: "center",
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: colors.bgElevated,
      borderWidth: 1,
      borderColor: colors.border,
    },
    platformChipActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    platformChipText: { color: colors.textSecondary, fontSize: 12, fontWeight: "600" },
    platformChipTextActive: { color: "#ffffff" },
    switchRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    switchLabel: { color: colors.textPrimary, fontSize: 13, fontWeight: "600" },
    error: { color: colors.scoreLow, fontSize: 12 },
    submitButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 10,
      paddingVertical: 12,
      alignItems: "center",
    },
    submitButtonText: { color: "#ffffff", fontWeight: "700", fontSize: 13.5 },
    videoList: { gap: 8 },
    emptyText: { color: colors.textSecondary, fontSize: 12.5 },
    videoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.bgCard,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 10,
    },
    videoThumb: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.bgElevated,
      alignItems: "center",
      justifyContent: "center",
    },
    videoInfo: { flex: 1, minWidth: 0, gap: 2 },
    videoSpot: { color: colors.textPrimary, fontSize: 13, fontWeight: "700" },
    videoMeta: { color: colors.textSecondary, fontSize: 11, textTransform: "capitalize" },
    removeButton: { paddingHorizontal: 8, paddingVertical: 6 },
    removeButtonText: { color: colors.scoreLow, fontSize: 11.5, fontWeight: "700" },
  });
}
