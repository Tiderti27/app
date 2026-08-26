import { useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS, scoreColor, type VideoPlatform } from "@spot/shared";
import { useSpotDetail } from "@/hooks/use-spot-detail";

const RATING_PRESETS = [60, 75, 85, 95, 100];

const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { spot, videos, myRating, saved, loading, submitRating, toggleSave } = useSpotDetail(id);
  const [ratingOpen, setRatingOpen] = useState(false);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={COLORS.accentPrimary} />
      </View>
    );
  }

  if (!spot) {
    return (
      <View style={styles.centered}>
        <Text style={styles.text}>Spot nicht gefunden.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{spot.name}</Text>
        <Pressable onPress={toggleSave} hitSlop={12}>
          <Text style={styles.heart}>{saved ? "♥" : "♡"}</Text>
        </Pressable>
      </View>

      <View style={styles.scoreRow}>
        <Text style={[styles.score, { color: scoreColor(spot.score) }]}>{spot.score.toFixed(0)}</Text>
        <Text style={styles.scoreCount}>{spot.score_count} Bewertungen</Text>
      </View>

      <Text style={styles.text}>
        {spot.address}, {spot.city}
      </Text>
      {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}

      <View style={styles.ratingSection}>
        {myRating !== null && <Text style={styles.myRating}>Deine Bewertung: {myRating}</Text>}

        {!ratingOpen ? (
          <Pressable style={styles.primaryButton} onPress={() => setRatingOpen(true)}>
            <Text style={styles.primaryButtonText}>War gut hier</Text>
          </Pressable>
        ) : (
          <View style={styles.presetRow}>
            {RATING_PRESETS.map((preset) => (
              <Pressable
                key={preset}
                style={styles.presetButton}
                onPress={() => {
                  submitRating(preset);
                  setRatingOpen(false);
                }}
              >
                <Text style={styles.presetText}>{preset}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {videos.length > 0 && (
        <View style={styles.videoSection}>
          <Text style={styles.sectionTitle}>Videos</Text>
          {videos.map((video) => (
            <Pressable
              key={video.id}
              style={styles.videoCard}
              onPress={() => Linking.openURL(video.video_url)}
            >
              <Text style={styles.videoPlatform}>{PLATFORM_LABEL[video.platform]}</Text>
              <Text style={styles.videoTitle} numberOfLines={1}>
                {video.title ?? video.video_url}
              </Text>
              {video.is_cooperation && <Text style={styles.cooperationBadge}>Kooperation</Text>}
            </Pressable>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bgPrimary },
  content: { padding: 16, gap: 8 },
  centered: { flex: 1, backgroundColor: COLORS.bgPrimary, alignItems: "center", justifyContent: "center" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: COLORS.textPrimary, fontSize: 24, fontWeight: "800", flexShrink: 1 },
  heart: { color: COLORS.accentPrimary, fontSize: 28 },
  scoreRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  score: { fontSize: 40, fontWeight: "900" },
  scoreCount: { color: COLORS.textSecondary },
  text: { color: COLORS.textSecondary },
  description: { color: COLORS.textPrimary, marginTop: 8, lineHeight: 20 },
  ratingSection: { marginTop: 16, gap: 10 },
  myRating: { color: COLORS.scoreHigh, fontWeight: "600" },
  primaryButton: {
    backgroundColor: COLORS.accentPrimary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: COLORS.textPrimary, fontWeight: "700" },
  presetRow: { flexDirection: "row", gap: 8 },
  presetButton: {
    flex: 1,
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  presetText: { color: COLORS.textPrimary, fontWeight: "700" },
  videoSection: { marginTop: 24, gap: 8 },
  sectionTitle: { color: COLORS.textPrimary, fontSize: 16, fontWeight: "700" },
  videoCard: {
    backgroundColor: COLORS.bgCard,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    gap: 4,
  },
  videoPlatform: { color: COLORS.accentSecondary, fontSize: 12, fontWeight: "700" },
  videoTitle: { color: COLORS.textPrimary },
  cooperationBadge: { color: COLORS.scoreMid, fontSize: 12, fontWeight: "600" },
});
