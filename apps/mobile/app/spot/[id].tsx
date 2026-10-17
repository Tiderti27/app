import { useEffect, useMemo } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ColorPalette, VideoPlatform } from "@spot/shared";
import { useSpotDetail } from "@/hooks/use-spot-detail";
import { useTheme } from "@/context/theme-context";
import { supabase } from "@/lib/supabase";
import { BackIcon, CategoryIcon, ClockIcon, HeartIcon, PlayIcon } from "@/components/icons";
import { ScoreBadge } from "@/components/score-badge";
import { PromotionSection } from "@/components/promotion-section";

const RATING_PRESETS = [60, 75, 85, 95, 100];

const PLATFORM_LABEL: Record<VideoPlatform, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
};

export default function SpotDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, mode } = useTheme();
  const heroBg = mode === "light" ? "#ece7f5" : "#161320";
  const styles = useMemo(() => createStyles(colors, heroBg), [colors, heroBg]);
  const { spot, videos, myRating, saved, loading, submitRating, toggleSave } = useSpotDetail(id);

  useEffect(() => {
    if (!id) return;
    supabase.rpc("log_spot_view", { p_spot_id: id }).then(() => {});
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accentPrimary} />
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} stickyHeaderIndices={[]}>
      <View style={styles.hero}>
        <CategoryIcon category={spot.category} size={44} color={colors.border} />
        <Pressable style={[styles.heroButton, styles.heroButtonLeft]} onPress={() => {}}>
          <BackIcon size={18} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={[styles.heroButton, styles.heroButtonRight]} onPress={toggleSave}>
          <HeartIcon size={18} color={colors.accentPrimary} filled={saved} />
        </Pressable>
        <View style={styles.heroScore}>
          <ScoreBadge score={spot.score} colors={colors} size="large" />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.infoSection}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{spot.name}</Text>
            <View style={styles.categoryChip}>
              <CategoryIcon category={spot.category} size={12} color={colors.textSecondary} />
              <Text style={styles.categoryChipText}>{spot.category}</Text>
            </View>
          </View>

          <Text style={styles.text}>
            {spot.address}, {spot.city} · {spot.score_count} Bewertungen
          </Text>
          {spot.description ? <Text style={styles.description}>{spot.description}</Text> : null}
        </View>

        <View style={styles.ratingSection}>
          {myRating === null ? (
            <Pressable style={styles.primaryButton} onPress={() => submitRating(90)}>
              <Text style={styles.primaryButtonText}>War gut hier</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.ratingHeader}>
                <Text style={styles.ratingHeaderLabel}>Deine Bewertung</Text>
                <Text style={styles.myRating}>{myRating} gespeichert</Text>
              </View>
              <View style={styles.presetRow}>
                {RATING_PRESETS.map((preset) => (
                  <Pressable
                    key={preset}
                    style={[styles.presetButton, myRating === preset && styles.presetButtonActive]}
                    onPress={() => submitRating(preset)}
                  >
                    <Text style={[styles.presetText, myRating === preset && styles.presetTextActive]}>{preset}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}
        </View>

        {videos.length > 0 && (
          <View style={styles.videoSection}>
            <Text style={styles.sectionTitle}>Videos</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {videos.map((video) => (
                <Pressable key={video.id} style={styles.videoCard} onPress={() => Linking.openURL(video.video_url)}>
                  <View style={styles.videoThumb}>
                    <PlayIcon size={20} color={colors.textPrimary} />
                  </View>
                  <Text style={styles.videoPlatform}>{PLATFORM_LABEL[video.platform]}</Text>
                  <Text style={styles.videoTitle} numberOfLines={1}>
                    {video.title ?? video.video_url}
                  </Text>
                  {video.is_cooperation && <Text style={styles.cooperationBadge}>Kooperation</Text>}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        <PromotionSection spotId={spot.id} colors={colors} />

        {spot.opening_hours && (
          <View style={styles.hoursRow}>
            <ClockIcon size={15} color={colors.accentPrimary} />
            <Text style={styles.hoursText}>
              {Object.values(spot.opening_hours).filter(Boolean).join(" · ") || "Keine Öffnungszeiten hinterlegt"}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function createStyles(colors: ColorPalette, heroBg: string) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    content: { paddingBottom: 24 },
    centered: { flex: 1, backgroundColor: colors.bgPrimary, alignItems: "center", justifyContent: "center" },
    hero: {
      height: 190,
      backgroundColor: heroBg,
      alignItems: "center",
      justifyContent: "center",
    },
    heroButton: {
      position: "absolute",
      top: 18,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.bgPrimary + "99",
      alignItems: "center",
      justifyContent: "center",
    },
    heroButtonLeft: { left: 18 },
    heroButtonRight: { right: 18 },
    heroScore: { position: "absolute", left: 20, bottom: -26 },
    body: { padding: 20, paddingTop: 38, gap: 22 },
    infoSection: { gap: 8 },
    titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
    title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800", flexShrink: 1 },
    categoryChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    categoryChipText: { color: colors.textSecondary, fontSize: 11.5, fontWeight: "700", textTransform: "capitalize" },
    text: { color: colors.textSecondary, fontSize: 13 },
    description: { color: colors.textPrimary, marginTop: 4, lineHeight: 20, fontSize: 13.5 },
    ratingSection: {
      gap: 12,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1.5,
      borderRadius: 16,
      padding: 16,
    },
    ratingHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    ratingHeaderLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: "700" },
    myRating: { color: colors.scoreHigh, fontWeight: "700", fontSize: 12 },
    primaryButton: {
      backgroundColor: colors.accentPrimary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    primaryButtonText: { color: "#ffffff", fontWeight: "700" },
    presetRow: { flexDirection: "row", gap: 8 },
    presetButton: {
      flex: 1,
      backgroundColor: colors.bgElevated,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 11,
      paddingVertical: 12,
      alignItems: "center",
    },
    presetButtonActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    presetText: { color: colors.textPrimary, fontWeight: "700" },
    presetTextActive: { color: "#ffffff" },
    videoSection: { gap: 10 },
    sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
    videoCard: { width: 120, gap: 6 },
    videoThumb: {
      width: 120,
      height: 150,
      borderRadius: 14,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    videoPlatform: { color: colors.accentSecondary, fontSize: 11, fontWeight: "700" },
    videoTitle: { color: colors.textPrimary, fontSize: 12 },
    cooperationBadge: { color: colors.scoreMid, fontSize: 11, fontWeight: "600" },
    hoursRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.bgCard,
      borderColor: colors.border,
      borderWidth: 1,
      borderRadius: 14,
      padding: 14,
    },
    hoursText: { color: colors.textPrimary, fontSize: 12.5, fontWeight: "600", flexShrink: 1 },
  });
}
